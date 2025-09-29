'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { stageService } from '@/lib/services/stage';
import { StageResponse, StageTemplateResponse } from '@/lib/api/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Workflow, X, FileText } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { stageTemplateService } from '@/lib/services/stage-template';

interface StageEditorProps {
	flowId: string;
}

const stageFormSchema = z.object({
	name: z.string().min(1, { message: 'Stage name is required.' }),
	type: z.enum(['introduction', 'policies', 'forms', 'documents', 'training', 'approval']),
});

type StageFormData = z.infer<typeof stageFormSchema>;

export default function StageEditor({ flowId }: StageEditorProps) {
	const [stages, setStages] = useState<StageResponse[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isTemplateSubmitting, setIsTemplateSubmitting] = useState(false);
	const [templates, setTemplates] = useState<StageTemplateResponse[]>([]);
	const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
	const [templatesError, setTemplatesError] = useState<string | null>(null);

	const form = useForm<StageFormData>({
		resolver: zodResolver(stageFormSchema) as any,
		defaultValues: {
			name: '',
			type: 'introduction',
		},
	});

	useEffect(() => {
		async function fetchStages() {
			try {
				const data = await stageService.listStages(flowId);
				setStages(data);
			} catch (error) {
				console.error('Failed to fetch stages:', error);
			}
		}
		fetchStages();
	}, [flowId]);

	useEffect(() => {
		async function fetchTemplates() {
			setIsLoadingTemplates(true);
			setTemplatesError(null);
			try {
				const data = await stageTemplateService.listTemplates();
				setTemplates(data);
			} catch (error) {
				console.error('Failed to fetch templates:', error);
				setTemplatesError('Failed to load templates');
			} finally {
				setIsLoadingTemplates(false);
			}
		}
		if (isTemplateModalOpen && templates.length === 0 && !isLoadingTemplates) {
			fetchTemplates();
		}
	}, [isTemplateModalOpen, templates.length, isLoadingTemplates]);

	const onSubmit = async (values: StageFormData) => {
		setIsSubmitting(true);
		try {
			const newStage = await stageService.createStage(flowId, values);
			setStages([...stages, newStage]);
			setIsModalOpen(false);
			form.reset();
		} catch (error) {
			console.error('Failed to create stage:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onCreateFromTemplate = async (templateId: string) => {
		setIsTemplateSubmitting(true);
		try {
			const newStage = await stageService.createStageFromTemplate(flowId, templateId);
			setStages([...stages, newStage]);
			setIsTemplateModalOpen(false);
		} catch (error) {
			console.error('Failed to create stage from template:', error);
		} finally {
			setIsTemplateSubmitting(false);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		form.reset();
	};

	const handleCloseTemplateModal = () => {
		setIsTemplateModalOpen(false);
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold flex items-center gap-2"><Workflow className="h-5 w-5" /> Stages</h2>
				<div className="flex gap-2">
					<Button onClick={() => setIsModalOpen(true)} className="gap-2">
						<Plus className="h-4 w-4" /> Add Stage
					</Button>
					<Button onClick={() => setIsTemplateModalOpen(true)} variant="outline" className="gap-2">
						<FileText className="h-4 w-4" /> Create from Template
					</Button>
				</div>
			</div>

			{stages.length === 0 ? (
				<div className="text-center py-10 text-gray-500">No stages yet. Click "Add Stage" to create one or "Create from Template" to use a predefined template.</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{stages.map((stage) => (
						<Link key={stage.id} href={`/flows/${flowId}/stages/${stage.id}`} className="group">
							<Card className="h-full hover:shadow-md transition-shadow">
								<CardHeader>
									<div className="flex items-start justify-between gap-3">
										<CardTitle className="text-lg group-hover:text-indigo-600 transition-colors">
											{stage.name}
										</CardTitle>
										<Badge>{stage.type || 'introduction'}</Badge>
									</div>
								</CardHeader>
								<CardContent className="text-sm text-gray-600">
									Order: <span className="font-medium text-gray-800">{stage.order ?? '-'}</span>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}

			{/* Create Stage Modal */}
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Create New Stage</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Stage Name</FormLabel>
										<FormControl>
											<Input placeholder="Enter stage name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Stage Type</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select stage type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="introduction">Introduction</SelectItem>
												<SelectItem value="policies">Policies</SelectItem>
												<SelectItem value="forms">Forms</SelectItem>
												<SelectItem value="documents">Documents</SelectItem>
												<SelectItem value="training">Training</SelectItem>
												<SelectItem value="approval">Approval</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-end gap-2 pt-4">
								<Button type="button" variant="outline" onClick={handleCloseModal}>
									Cancel
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? 'Creating...' : 'Create Stage'}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Template Selection Modal */}
			<Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Create Stage from Template</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-sm text-gray-600">
							Select a template to create a stage with predefined content and structure.
						</p>
						{isLoadingTemplates ? (
							<div className="text-sm text-gray-500">Loading templates...</div>
						) : templatesError ? (
							<div className="text-sm text-red-600">{templatesError}</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{templates.map((template) => (
									<Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
										<CardHeader className="pb-3">
											<div className="flex items-start justify-between gap-3">
												<CardTitle className="text-base">{template.name}</CardTitle>
												<Badge variant="secondary">{template.type}</Badge>
											</div>
										</CardHeader>
										<CardContent className="pt-0">
											<p className="text-sm text-gray-600 mb-3">{template.description}</p>
											<Button
												onClick={() => onCreateFromTemplate(template.id)}
												disabled={isTemplateSubmitting}
												className="w-full"
												size="sm"
											>
												{isTemplateSubmitting ? 'Creating...' : 'Use Template'}
											</Button>
										</CardContent>
									</Card>
								))}
							</div>
						)}
						<div className="flex justify-end pt-4">
							<Button type="button" variant="outline" onClick={handleCloseTemplateModal}>
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}