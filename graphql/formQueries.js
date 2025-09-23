import { gql } from "@apollo/client";

export const CREATE_PROJECT = gql`
  mutation CreateProject($data: ProjectsInput!) {
    createProject(data: $data) {
      data {
        id
      }
    }
  }
`;