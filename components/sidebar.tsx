import Link from "next/link";

export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", href: "/" },
    { name: "Schedule Posts", href: "/schedule" },
    { name: "Analytics", href: "/analytics" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    // We use bg-primary here, which corresponds to the --color-primary variable in globals.css
    <aside className="w-64 bg-primary text-white h-screen fixed left-0 top-0 flex flex-col p-4 shadow-xl">
      {/* Logo Area */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-wider">SocialDesk</h1>
        {/* We use text-accent here */}
        <p className="text-accent text-xs">Internship Project</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                // hover:bg-secondary adds interaction using your palette
                className="block px-4 py-2 rounded transition-colors hover:bg-secondary hover:text-white"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile / Footer */}
      <div className="pt-4 border-t border-secondary">
        <div className="text-sm text-gray-300">Logged in as Admin</div>
      </div>
    </aside>
  );
}