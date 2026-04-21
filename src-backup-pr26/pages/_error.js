// src/pages/_error.js
// Custom error page for Pages Router

function Error({ statusCode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1>{statusCode || '500'} - Something went wrong</h1>
      <p>
        {statusCode === 404 
          ? 'The page you are looking for does not exist.' 
          : 'An unexpected error occurred on the server.'}
      </p>
      <a href="/" style={{
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#0070f3',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px'
      }}>
        Go back home
      </a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;