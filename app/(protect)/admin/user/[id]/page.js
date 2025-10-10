'use client';
// Components - reuse same components as profile page
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileEducation from '@/components/profile/ProfileEducation';
import ProfileStats from '@/components/profile/ProfileState';
import ProfilePortfolio from '@/components/profile/ProfilePortfolio';
// Hooks
import { useState, useEffect, use } from "react";
import { useQuery } from "@apollo/client/react";
// GraphQL
import { GET_USER_PROFILE } from '@/graphql/userQueries';

export default function AdminUserDetailPage({ params }) {
    // const documentId = params?.id;
    const { id: documentId } = use(params);
    const [userData, setUserData] = useState(null);

    const { loading, error, data: profileData, refetch } = useQuery(GET_USER_PROFILE, {
        variables: { documentId },
        skip: !documentId,
    });

    useEffect(() => {
        if (profileData && profileData.usersPermissionsUser) {
            setUserData(profileData.usersPermissionsUser);
        }
    }, [profileData]);

    if (!userData) return <p>Loading user data...</p>;
    console.log("User Data:", userData);

    return (
        <div>
            <ProfileHeader data={userData} other />
            {(userData.academic_types.length == 0 && userData.role.name == "Admin") || (userData.academic_types.length == 0 && userData.role.name == "Super admin") ? (
                <>
                    {/* ADMIN */}
                </>
            ) : (
                <>
                    <ProfileStats userId={userData} />
                    <ProfileEducation data={userData.education} />
                    <ProfilePortfolio data={userData} />
                </>
            )}
        </div>
    );
}
