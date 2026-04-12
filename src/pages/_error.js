function Error({ statusCode }) {
  return (
    <div className="error-container">
      <h1>{statusCode || 'Something went wrong'}</h1>
      <p>Please try again later or contact support.</p>
      <a href="/" className="home-link">Go back home</a>
      
      <style jsx>{`
        .error-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
        }
        .home-link {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 8px;
        }
      `}</style>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error