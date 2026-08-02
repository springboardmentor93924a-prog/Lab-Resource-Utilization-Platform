import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Topbar />
                <div className="page-wrapper">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Layout;