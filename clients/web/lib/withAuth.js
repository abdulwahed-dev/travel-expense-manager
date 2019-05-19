import React from "react";
import { Query } from "react-apollo";
import { gql } from "apollo-boost";
import { checkIfLoggedIn, redirect } from "./utils";
import AuthWrapper from "../components/AuthWrapper";

const ME_QUERY = gql`
  query {
    me {
      id
      email
    }
  }
`;

export default function withAuth(WrappedComponent, to = "/login") {
  return class Authenticated extends React.Component {
    static async getInitialProps(ctx) {
      let componentProps = {};
      if (WrappedComponent.getInitialProps) {
        componentProps = await WrappedComponent.getInitialProps(ctx);
      }

      const loggedUser = await ctx.apolloClient
        .query({
          query: ME_QUERY
        })
        .then(response => response.data.me)
        .catch(error => null);

      if (!loggedUser) {
        redirect(ctx, to);
      }

      return { loggedUser, ...componentProps };
    }

    render() {
      return (
        <AuthWrapper {...this.props}>
          <WrappedComponent {...this.props} />
        </AuthWrapper>
      );
    }
  };
}