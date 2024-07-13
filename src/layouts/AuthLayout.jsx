import logo from "../assets/xenssen_logo.png";

function AuthLayout({ children }) {
  return (
    <>
      <header className="flex justify-center items-center py-4 h-24 shadow-lg bg-primary">
        <div className="flex items-center">
          <img src={logo} alt="logo" className="h-12 mr-3" />
          <span className="text-white text-3xl font-bold">Textora</span>
        </div>
      </header>

      {children}
    </>
  );
}

export default AuthLayout;
