'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { flowService } from '@/lib/services/flow';
import { FlowResponse, FlowUpdate } from '@/lib/api/schemas';
import StageEditor from '@/components/shared/stage-editor';

const formSchema = z.object({
	name: z.string().min(1, { message: 'Flow name is required.' }),
	description: z.string().optional(),
	duration_days: z.union([z.string(), z.number()]).optional().transform((val) => {
		if (val === '' || val === undefined) return undefined;
		const num = Number(val);
		return isNaN(num) ? undefined : num;
	}),
});

type FormData = z.infer<typeof formSchema>;

export default function FlowDetailPage() {
	const params = useParams();
	const { flowId } = params;
	const [flow, setFlow] = useState<FlowResponse | null>(null);
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});

	useEffect(() => {
		async function fetchFlow() {
			if (typeof flowId === 'string') {
				try {
					const data = await flowService.getFlow(flowId);
					setFlow(data);
					form.reset({
						name: data.name,
						description: data.description ?? undefined,
						duration_days: data.duration_days ?? undefined,
					});
				} catch (error) {
					console.error('Failed to fetch flow:', error);
				}
			}
		}
		fetchFlow();
	}, [flowId, form]);

	async function onSubmit(values: FormData) {
		if (typeof flowId === 'string') {
			try {
				await flowService.updateFlow(flowId, values as FlowUpdate);
			} catch (error) {
				console.error('Failed to update flow:', error);
			}
		}
	}

	if (!flow) {
		return <div>Loading...</div>;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="rounded-xl p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow">
				<h1 className="text-2xl md:text-3xl font-bold">{flow.name}</h1>
				<p className="text-white/80 mt-1">Edit details and manage stages.</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Flow Details</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Flow Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="duration_days"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Duration (Days)</FormLabel>
										<FormControl>
											<Input type="number" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="md:col-span-2 flex justify-end">
								<Button type="submit">Save Changes</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Stages</CardTitle>
				</CardHeader>
				<CardContent>
					<StageEditor flowId={flowId as string} />
				</CardContent>
			</Card>
		</div>
	);
}