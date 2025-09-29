'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { newHireService } from '@/lib/services/new-hire';
import { flowService } from '@/lib/services/flow';
import { NewHireResponse, FlowResponse } from '@/lib/api/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function NewHiresPage() {
	const [newHires, setNewHires] = useState<NewHireResponse[]>([]);
	const [query, setQuery] = useState('');
	const [inviteOpen, setInviteOpen] = useState(false);
	const [flows, setFlows] = useState<FlowResponse[]>([]);
	const [inviteLoading, setInviteLoading] = useState(false);
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [flowId, setFlowId] = useState('');
	const [error, setError] = useState<string>('');

	async function loadNewHires() {
		try {
			const data = await newHireService.listNewHires();
			setNewHires(data);
		} catch (error) {
			console.error('Failed to fetch new hires:', error);
		}
	}

	useEffect(() => {
		loadNewHires();
	}, []);

	useEffect(() => {
		async function loadFlows() {
			try {
				const data = await flowService.listFlows();
				setFlows(data);
				if (data.length > 0) setFlowId((prev) => prev || data[0].id);
			} catch (error) {
				console.error('Failed to load flows:', error);
			}
		}
		if (inviteOpen) loadFlows();
	}, [inviteOpen]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return newHires;
		return newHires.filter((h) => `${h.first_name} ${h.last_name}`.toLowerCase().includes(q) || (h.email || '').toLowerCase().includes(q));
	}, [newHires, query]);

	async function handleInvite() {
		try {
			setInviteLoading(true);
			setError('');
			if (!firstName || !lastName || !email || !flowId) {
				setError('All fields are required.');
				return;
			}
			await newHireService.createNewHire({ first_name: firstName, last_name: lastName, email, flow_id: flowId });
			setInviteOpen(false);
			setFirstName('');
			setLastName('');
			setEmail('');
			setFlowId('');
			await loadNewHires();
		} catch (e: any) {
			console.error('Failed to invite new hire:', e);
			setError(e?.message || 'Failed to invite new hire');
		} finally {
			setInviteLoading(false);
		}
	}

	return (
		<div className="space-y-6">
			{/* Header with gradient */}
			<div className="rounded-xl p-6 bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white shadow">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold">New Hires</h1>
						<p className="text-white/80 mt-1">Invite and track your new team members' onboarding progress.</p>
					</div>
					<Button variant="secondary" className="gap-2" onClick={() => setInviteOpen(true)}><Plus className="h-4 w-4" /> Invite New Hire</Button>
				</div>
			</div>

			{/* Search */}
			<div className="flex items-center gap-3">
				<div className="relative flex-1">
					<Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<Input placeholder="Search new hires..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
				</div>
				<Button className="gap-2" onClick={() => setInviteOpen(true)}><Plus className="h-4 w-4" /> Add</Button>
			</div>

			{/* Grid of cards */}
			{filtered.length === 0 ? (
				<div className="text-center py-16 text-gray-500">
					<Users className="h-10 w-10 mx-auto mb-3 text-gray-400" />
					<p>No new hires yet. Invite your first team member.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{filtered.map((hire) => (
						<Link key={hire.id} href={`/new-hires/${hire.id}`} className="group">
							<Card className="h-full hover:shadow-lg transition-shadow">
								<CardHeader>
									<CardTitle className="text-lg group-hover:text-sky-600 transition-colors">
										{hire.first_name} {hire.last_name}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-500">Email</span>
										<span className="text-sm font-medium text-gray-700 line-clamp-1">{hire.email}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-500">Status</span>
										<Badge variant={hire.status === 'active' ? 'success' : hire.status === 'completed' ? 'secondary' : 'default'}>
											{hire.status}
										</Badge>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}

			{/* Invite Modal */}
			<Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Invite New Hire</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						{error && <div className="text-sm text-red-600">{error}</div>}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<label className="text-sm text-gray-700">First Name</label>
								<Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
							</div>
							<div>
								<label className="text-sm text-gray-700">Last Name</label>
								<Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
							</div>
						</div>
						<div>
							<label className="text-sm text-gray-700">Email</label>
							<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
						</div>
						<div>
							<label className="text-sm text-gray-700">Assign to Flow</label>
							<select className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm" value={flowId} onChange={(e) => setFlowId(e.target.value)}>
								<option value="" disabled>Select a flow</option>
								{flows.map((f) => (
									<option key={f.id} value={f.id}>{f.name}</option>
								))}
							</select>
						</div>
						<div className="flex justify-end gap-2 pt-2">
							<Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
							<Button onClick={handleInvite} disabled={inviteLoading}>{inviteLoading ? 'Inviting...' : 'Send Invite'}</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}