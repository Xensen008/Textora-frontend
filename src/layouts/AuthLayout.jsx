import logo from "../assets/Textora3.jpg";

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen pt-4" style={{ backgroundColor: '#b7c0b3' }}> 
      <header className="flex justify-center items-center py-3" style={{ backgroundColor: '#b7c0b3', borderRadius: '25px', margin: '0 20px', boxShadow: '0 8px 12px rgba(0, 0, 0, 0.2)' }}>
        <div className="flex items-center">
          <img src={logo} alt="logo" className="h-24 mr-3" /> {/* Increased logo size */}
          <span className="text-[#082b1a] text-3xl font-bold">Textora</span>
        </div>
      </header>
      
      <main style={{ color: '#b7c0b3' }}>
        {children}
      </main>
    </div>
  );
}

export default AuthLayout;
