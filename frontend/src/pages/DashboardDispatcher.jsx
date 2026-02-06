
import { useAuth } from '../context/AuthContext';
import DashboardHome from './DashboardHome';
import ManagerDashboard from './ManagerDashboard';
import MemberDashboard from './MemberDashboard';

const DashboardDispatcher = () => {
    const { user } = useAuth();

    // Loading check (though usually protected route handles this)
    if (!user) return null;

    if (user.role === 'Team Member') {
        return <MemberDashboard />;
    }

    if (user.role === 'Project Manager' || user.role === 'Project Admin') {
        return <ManagerDashboard />;
    }

    // Default to Admin/Standard Dashboard
    return <DashboardHome />;
};

export default DashboardDispatcher;
