'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { flowService } from '@/lib/services/flow';
import { FlowResponse } from '@/lib/api/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Search } from 'lucide-react';

export default function FlowsPage() {
	const [flows, setFlows] = useState<FlowResponse[]>([]);
	const [query, setQuery] = useState('');
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		duration_days: 7,
		status: 'draft'
	});

	useEffect(() => {
		async function fetchFlows() {
			try {
				const data = await flowService.listFlows();
				setFlows(data);
			} catch (error) {
				console.error('Failed to fetch flows:', error);
			}
		}
		fetchFlows();
	}, []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return flows;
		return flows.filter((f) => (f.name || '').toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q));
	}, [flows, query]);

	const handleCreateFlow = async () => {
		if (!formData.name.trim()) return;
		
		setIsCreating(true);
		try {
			const newFlow = await flowService.createFlow({
				name: formData.name,
				description: formData.description,
				duration_days: formData.duration_days,
				status: formData.status
			});
			
			setFlows(prev => [newFlow, ...prev]);
			setIsCreateModalOpen(false);
			setFormData({ name: '', description: '', duration_days: 7, status: 'draft' });
		} catch (error) {
			console.error('Failed to create flow:', error);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header with gradient */}
			<div className="rounded-xl p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold">Onboarding Flows</h1>
						<p className="text-white/80 mt-1">Create and manage your company's onboarding experiences.</p>
					</div>
					<Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
						<DialogTrigger asChild>
							<Button variant="secondary" className="gap-2"><Plus className="h-4 w-4" /> Create Flow</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Create New Onboarding Flow</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 mt-6">
								<div>
									<Label htmlFor="name">Flow Name *</Label>
									<Input
										id="name"
										placeholder="Enter flow name"
										value={formData.name}
										onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
									/>
								</div>
								<div>
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										placeholder="Describe the onboarding flow"
										value={formData.description}
										onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
									/>
								</div>
								<div>
									<Label htmlFor="duration">Duration (days)</Label>
									<Input
										id="duration"
										type="number"
										min="1"
										value={formData.duration_days}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 1 }))}
									/>
								</div>
								<div>
									<Label htmlFor="status">Status</Label>
									<Select value={formData.status} onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value }))}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="draft">Draft</SelectItem>
											<SelectItem value="published">Published</SelectItem>
											<SelectItem value="archived">Archived</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex gap-2 pt-4">
									<Button 
										onClick={handleCreateFlow} 
										disabled={isCreating || !formData.name.trim()}
										className="flex-1"
									>
										{isCreating ? 'Creating...' : 'Create Flow'}
									</Button>
									<Button 
										variant="outline" 
										onClick={() => setIsCreateModalOpen(false)}
										className="flex-1"
									>
										Cancel
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Search */}
			<div className="flex items-center gap-3">
				<div className="relative flex-1">
					<Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<Input placeholder="Search flows..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
				</div>
				<Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
					<DialogTrigger asChild>
						<Button className="gap-2"><Plus className="h-4 w-4" /> New Flow</Button>
					</DialogTrigger>
				</Dialog>
			</div>

			{/* Grid of cards */}
			{filtered.length === 0 ? (
				<div className="text-center py-16 text-gray-500">
					<FileText className="h-10 w-10 mx-auto mb-3 text-gray-400" />
					<p>No flows yet. Create your first onboarding flow.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{filtered.map((flow) => (
						<Link key={flow.id} href={`/flows/${flow.id}`} className="group">
							<Card className="h-full hover:shadow-lg transition-shadow">
								<CardHeader>
									<div className="flex items-start justify-between gap-3">
										<CardTitle className="text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">{flow.name}</CardTitle>
										<Badge variant={flow.status === 'published' ? 'success' : flow.status === 'draft' ? 'secondary' : 'default'}>
											{flow.status || 'draft'}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="space-y-3">
									<p className="text-sm text-gray-600 line-clamp-2">{flow.description || 'No description provided.'}</p>
									<div className="flex items-center justify-between text-sm text-gray-500">
										<span>Duration</span>
										<span className="font-medium text-gray-700">{flow.duration_days ?? 0} days</span>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}