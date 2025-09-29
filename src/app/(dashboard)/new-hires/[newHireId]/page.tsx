'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { newHireService } from '@/lib/services/new-hire';
import { NewHireResponse } from '@/lib/api/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function NewHireDetailPage() {
	const params = useParams();
	const { newHireId } = params;
	const [newHire, setNewHire] = useState<NewHireResponse | null>(null);

	useEffect(() => {
		async function fetchNewHire() {
			if (typeof newHireId === 'string') {
				try {
					const data = await newHireService.getNewHire(newHireId);
					setNewHire(data);
				} catch (error) {
					console.error('Failed to fetch new hire:', error);
				}
			}
		}
		fetchNewHire();
	}, [newHireId]);

	if (!newHire) {
		return <div>Loading...</div>;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="rounded-xl p-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow">
				<h1 className="text-2xl md:text-3xl font-bold">{newHire.first_name} {newHire.last_name}</h1>
				<p className="text-white/80 mt-1">{newHire.email}</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Overview</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="p-4 rounded-lg border bg-white">
								<p className="text-sm text-gray-500">Assigned Flow</p>
								<p className="font-medium text-gray-900">{newHire.flow_id ? 'Assigned' : 'Not assigned'}</p>
							</div>
							<div className="p-4 rounded-lg border bg-white">
								<p className="text-sm text-gray-500">Status</p>
								<Badge variant={newHire.status === 'active' ? 'success' : newHire.status === 'completed' ? 'secondary' : 'default'}>
									{newHire.status}
								</Badge>
							</div>
						</div>
						<div className="p-4 rounded-lg border bg-white">
							<p className="text-sm text-gray-500 mb-2">Notes</p>
							<p className="text-gray-700">No notes yet.</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Actions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<button className="w-full text-sm px-3 py-2 rounded-md border hover:bg-gray-50">Resend Invitation</button>
						<button className="w-full text-sm px-3 py-2 rounded-md border hover:bg-gray-50">Mark Complete</button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}