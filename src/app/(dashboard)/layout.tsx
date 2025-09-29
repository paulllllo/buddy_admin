'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/components/shared/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	// Build breadcrumbs from pathname under dashboard
	const segments = pathname.split('/').filter(Boolean); // remove empty
	const crumbs = segments.map((seg, idx) => {
		const href = '/' + segments.slice(0, idx + 1).join('/');
		const label = decodeURIComponent(seg)
			.replace(/\[(.*?)\]/g, '$1')
			.replace(/-/g, ' ');
		return { href, label };
	});

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<div className="flex-1 flex flex-col">
				{/* Top App Bar with breadcrumbs */}
				<div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
					<div className="px-6 py-3">
						<nav className="text-sm text-gray-600">
							<Link href="/" className="hover:text-gray-900">Home</Link>
							{crumbs.map((c, i) => (
								<span key={c.href}>
									<span className="px-2 text-gray-400">/</span>
									{i < crumbs.length - 1 ? (
										<Link href={c.href} className="hover:text-gray-900 capitalize">{c.label}</Link>
									) : (
										<span className="text-gray-900 font-medium capitalize">{c.label}</span>
									)}
								</span>
							))}
						</nav>
					</div>
				</div>

				<main className="flex-1 p-8">
					{children}
				</main>
			</div>
		</div>
	);
}
