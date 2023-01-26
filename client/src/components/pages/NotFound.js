import React from "react";

const NotFound = () => {
  return (
    <Layout loggedIn = {false}>
    <div>
      <h1>404 Not Found</h1>
      <p>The page you requested couldn't be found.</p>
    </div>
    </Layout>
  );
};

export default NotFound;
