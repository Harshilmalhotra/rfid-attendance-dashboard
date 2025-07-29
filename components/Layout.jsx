import Sidebar from "./Sidebar";
import PageWrapper from "./PageWrapper";
import Footer from "./Footer";

const Layout = ({ children, withSidebar = false }) => (
  <div className="flex flex-col min-h-screen">
    <div className="flex-grow flex">
      {withSidebar && <Sidebar />}
      <PageWrapper>{children}</PageWrapper>
    </div>
    <Footer />
  </div>
);

export default Layout;
