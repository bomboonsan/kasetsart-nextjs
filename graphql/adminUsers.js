export const GET_USERS = gql`
    query GetUsers {
        users {
            id
            firstnameTH
            lastnameTH
            firstnameEN
            lastnameEN
            department { title}
            faculty { title }
            organization { title }
            email
            role
        }
    }
`;