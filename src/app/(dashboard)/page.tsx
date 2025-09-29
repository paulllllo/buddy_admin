'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Settings, TrendingUp } from 'lucide-react';

export default function HomePage() {
	const { user } = useAuth();

	const stats = [
		{ title: 'Total Flows', value: '0', description: 'Onboarding flows created', icon: FileText, color: 'text-blue-600' },
		{ title: 'Active New Hires', value: '0', description: 'Currently onboarding', icon: Users, color: 'text-green-600' },
		{ title: 'Completion Rate', value: '0%', description: 'Average completion rate', icon: TrendingUp, color: 'text-purple-600' },
		{ title: 'Settings', value: '1', description: 'Company configured', icon: Settings, color: 'text-orange-600' },
	];

	return (
		<div className="space-y-6">
			<div className="rounded-xl p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow">
				<h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
				<p className="text-white/80 mt-1">Welcome back, {user?.first_name}. Here's an overview of your onboarding portal.</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{stats.map((stat) => (
					<Card key={stat.title}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
							<stat.icon className={`h-4 w-4 ${stat.color}`} />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className="text-xs text-muted-foreground">{stat.description}</p>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<Link href="/flows" className="group">
					<Card className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle>Create Onboarding Flow</CardTitle>
							<CardDescription>Set up your first onboarding process</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-600 group-hover:text-gray-800">Build tailored onboarding experiences for your company.</p>
						</CardContent>
					</Card>
				</Link>
				<Link href="/new-hires" className="group">
					<Card className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle>Add New Hires</CardTitle>
							<CardDescription>Invite team members to onboard</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-600 group-hover:text-gray-800">Manage invitations and track progress.</p>
						</CardContent>
					</Card>
				</Link>
				<Link href="/settings" className="group">
					<Card className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle>Configure Settings</CardTitle>
							<CardDescription>Customize your company settings</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-600 group-hover:text-gray-800">Branding, profile, and account preferences.</p>
						</CardContent>
					</Card>
				</Link>
			</div>
		</div>
	);
}
