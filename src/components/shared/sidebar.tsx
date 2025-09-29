'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Users, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
	{ href: '/', label: 'Dashboard', icon: Home },
	{ href: '/flows', label: 'Onboarding Flows', icon: FileText },
	{ href: '/new-hires', label: 'New Hires', icon: Users },
	{ href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
	const pathname = usePathname();
	const { user, logout } = useAuth();

	return (
		<aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-screen">
			{/* Company/App Header */}
			<div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
				<h1 className="text-lg font-bold text-gray-900">OaaS Admin</h1>
				<p className="text-xs text-gray-600">Onboarding as a Service</p>
			</div>

			{/* Navigation */}
			<nav className="flex-1 p-4 space-y-1">
				{navItems.map((item) => {
					const active = pathname === item.href;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
								active ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
							}`}
						>
							<item.icon className="h-5 w-5" />
							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>

			{/* User Section */}
			<div className="mt-auto p-4 border-t">
				{user && (
					<div className="p-3 mb-3 rounded-md bg-white border">
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
								<User className="h-4 w-4 text-gray-600" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-gray-900 truncate">
									{user.first_name} {user.last_name}
								</p>
								<p className="text-xs text-gray-500 truncate">{user.email}</p>
							</div>
						</div>
					</div>
				)}

				<button
					onClick={logout}
					className="w-full flex items-center justify-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 bg-white border hover:bg-gray-50 transition-colors"
				>
					<LogOut className="h-5 w-5" />
					<span>Logout</span>
				</button>
			</div>
		</aside>
	);
}