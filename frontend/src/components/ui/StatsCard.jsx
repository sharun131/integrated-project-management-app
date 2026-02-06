import GlassPanel from './GlassPanel';

const StatsCard = ({ title, value, icon, trend, subtext, color = "primary" }) => {
    // Map color names to Tailwind classes
    const colorClasses = {
        primary: "bg-primary/10 text-primary border-primary/20",
        secondary: "bg-purple-100 text-purple-700 border-purple-200",
        success: "bg-green-100 text-green-700 border-green-200",
        warning: "bg-amber-100 text-amber-700 border-amber-200",
        danger: "bg-red-100 text-red-700 border-red-200",
    };

    const classes = colorClasses[color] || colorClasses.primary;

    return (
        <GlassPanel className="relative overflow-hidden group hover:shadow-lg transition-shadow border border-gray-200">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-600 text-sm uppercase tracking-wider font-medium">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${classes} border`}>
                    {icon}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
                {trend && (
                    <span className={`font-bold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                        <span className="text-gray-500 font-normal ml-1">from last month</span>
                    </span>
                )}
                {subtext && <span className="text-gray-500">{subtext}</span>}
            </div>
        </GlassPanel>
    );
};

export default StatsCard;
