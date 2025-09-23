'use client';
// Components
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileEducation from '@/components/profile/ProfileEducation';
// Hooks
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client/react";
// GraphQL
import { GET_ME, GET_USER_PROFILE, UPDATE_USER_PROFILE, GET_PROFILE_OPTIONS } from '@/graphql/userQueries';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [userData, setUserData] = useState(null);

    const { data: meData, loading: meLoading } = useQuery(GET_ME, {
        skip: status !== 'authenticated',
    });
    const userDocumentId = meData?.me?.documentId;
    const userId = session?.user?.id;

    const { loading, error, data: profileData, refetch } = useQuery(GET_USER_PROFILE, {
        variables: { documentId: userDocumentId },
        skip: !userDocumentId,
    });

    useEffect(() => {
        if (profileData && profileData.usersPermissionsUser) {
            console.log("Fetched Profile Data:", profileData.usersPermissionsUser);
            setUserData(profileData.usersPermissionsUser);
        }
    }, [profileData]);

    // if (loading) return <p>Loading...</p>;
    // if (error) return <p>Error: {error.message}</p>;
    // if (!profileData || !profileData.usersPermissionsUser) return <p>No user data found.</p>;
    if (!userData) return <p>Loading user data...</p>;
    console.log("User Data:", userData);


    return (
        <div>
            <ProfileHeader data={userData} />
            <ProfileEducation data={userData.education} />
        </div>
    );
}