'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { stageService } from '@/lib/services/stage';
import { contentBlockService } from '@/lib/services/content-block';
import { StageResponse, ContentBlockResponse, ContentTypeResponse } from '@/lib/api/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Plus, Layout, Trash2, Edit, GripVertical } from 'lucide-react';
import { getOnboardingAsAService } from '@/lib/api/endpoints';

const api = getOnboardingAsAService();

function LabeledInput({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<div>
			<label className="text-sm font-medium text-gray-700">{label}</label>
			<Input
				{...rest}
				className="mt-1"
			/>
		</div>
	);
}

function LabeledTextarea({ label, ...rest }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<div>
			<label className="text-sm font-medium text-gray-700">{label}</label>
			<textarea
				{...rest}
				className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
				rows={rest.rows || 4}
			/>
		</div>
	);
}

interface StageEditorProps {
	flowId: string;
}

type AnyUpdatePayload = any; // Simplified for now

export default function StageDetailPage() {
	const params = useParams();
	const { flowId, stageId } = params;
	const [stage, setStage] = useState<StageResponse | null>(null);
	const [blocks, setBlocks] = useState<ContentBlockResponse[]>([]);
	const [contentTypes, setContentTypes] = useState<ContentTypeResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
	const [type, setType] = useState<string>('');
	const [configValues, setConfigValues] = useState({ required: false, display: { width: 'full' } });
	const [contentValues, setContentValues] = useState<any>({});
	const [orderIndex, setOrderIndex] = useState<number | undefined>(undefined);
	const [isReordering, setIsReordering] = useState(false);

	useEffect(() => {
		load();
	}, [flowId, stageId]);

	async function load() {
		if (!flowId || !stageId) return;
		setIsLoading(true);
		try {
			const [stagesData, blocksData, typesData] = await Promise.all([
				stageService.listStages(flowId as string).then(stages => stages.find(s => s.id === stageId) || null),
				contentBlockService.listContentBlocks(stageId as string),
				api.listContentTypesApiContentTypesGet(),
			]);
			setStage(stagesData);
			setBlocks(blocksData);
			setContentTypes(typesData);
		} catch (error) {
			console.error('Failed to load data:', error);
		} finally {
			setIsLoading(false);
		}
	}

	function openCreate() {
		setEditingBlockId(null);
		setType('');
		setConfigValues({ required: false, display: { width: 'full' } });
		setContentValues({});
		setOrderIndex(undefined);
		setOpen(true);
	}

	function openEdit(blockId: string) {
		const block = blocks.find((b) => b.id === blockId);
		if (!block) return;
		setEditingBlockId(blockId);
		setType(block.type);
		setConfigValues((block as any).config || { required: false, display: { width: 'full' } });
		setContentValues((block as any).content || {});
		setOrderIndex((block as any).order_index ?? undefined);
		setOpen(true);
	}

	function resetByType(newType: string) {
		setType(newType);
		setConfigValues({ required: false, display: { width: 'full' } });
		setContentValues({});
		setOrderIndex(undefined);
	}

	async function handleDelete(blockId: string) {
		if (!confirm('Delete this content block?')) return;
		try {
			await contentBlockService.deleteContentBlock(blockId);
			await load();
		} catch (e) {
			console.error('Failed to delete content block:', e);
		}
	}

	// Drag and drop reordering
	const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

	const handleDragStart = (e: React.DragEvent, blockId: string) => {
		setDraggedBlockId(blockId);
		e.dataTransfer.effectAllowed = 'move';
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	};

	const handleDrop = async (e: React.DragEvent, targetBlockId: string) => {
		e.preventDefault();
		if (!draggedBlockId || draggedBlockId === targetBlockId || !stageId || Array.isArray(stageId)) {
			setDraggedBlockId(null);
			return;
		}

		setIsReordering(true);
		try {
			// Find the dragged block and target block
			const draggedBlock = blocks.find(b => b.id === draggedBlockId);
			const targetBlock = blocks.find(b => b.id === targetBlockId);
			
			if (!draggedBlock || !targetBlock) return;

			// Create new order array
			const newBlocks = [...blocks];
			const draggedIndex = newBlocks.findIndex(b => b.id === draggedBlockId);
			const targetIndex = newBlocks.findIndex(b => b.id === targetBlockId);
			
			// Remove dragged block and insert at target position
			const [removed] = newBlocks.splice(draggedIndex, 1);
			newBlocks.splice(targetIndex, 0, removed);
			
			// Update order_index for all blocks
			const reorderData = newBlocks.map((block, index) => ({
				id: block.id,
				order_index: index + 1
			}));

			// Call the reorder API
			await contentBlockService.reorderContentBlocks(stageId, {
				content_blocks: reorderData
			});

			// Reload to get the updated order
			await load();
		} catch (error) {
			console.error('Failed to reorder content blocks:', error);
		} finally {
			setIsReordering(false);
			setDraggedBlockId(null);
		}
	};

	const handleDragEnd = () => {
		setDraggedBlockId(null);
	};

	// Helper components
	function SettingsSection() {
		return (
			<div className="space-y-3">
				<div>
					<label className="text-sm font-medium text-gray-700">Required</label>
					<input
						type="checkbox"
						checked={configValues.required}
						onChange={(e) => setConfigValues((p) => ({ ...p, required: e.target.checked }))}
						className="mt-1 ml-2"
					/>
				</div>
				<div>
					<label className="text-sm font-medium text-gray-700">Display Width</label>
					<select
						value={configValues.display?.width || 'full'}
						onChange={(e) => setConfigValues((p) => ({ ...p, display: { ...p.display, width: e.target.value } }))}
						className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
					>
						<option value="full">Full Width</option>
						<option value="half">Half Width</option>
						<option value="third">Third Width</option>
					</select>
				</div>
			</div>
		);
	}

	function renderContentFields() {
		switch (type) {
			case 'header':
				return (
					<div className="space-y-3">
						<LabeledInput label="Title" value={contentValues.title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, title: e.target.value }))} />
						<LabeledInput label="Subtitle" value={contentValues.subtitle || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, subtitle: e.target.value }))} />
					</div>
				);
			case 'description':
				return (
					<div className="space-y-3">
						<LabeledTextarea label="Text" value={contentValues.text || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContentValues((p: any) => ({ ...p, text: e.target.value }))} />
					</div>
				);
			case 'media':
				return (
					<div className="space-y-3">
						<LabeledInput label="File URL" value={contentValues.file_url || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, file_url: e.target.value }))} />
						<LabeledInput label="Alt Text" value={contentValues.alt_text || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, alt_text: e.target.value }))} />
					</div>
				);
			case 'single_choice':
				return (
					<div className="space-y-3">
						<LabeledInput label="Question" value={contentValues.question || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, question: e.target.value }))} />
						<LabeledInput label="Options (comma-separated)" value={contentValues.options?.join(', ') || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, options: e.target.value.split(',').map(s => s.trim()) }))} />
					</div>
				);
			case 'multiple_choice':
				return (
					<div className="space-y-3">
						<LabeledInput label="Question" value={contentValues.question || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, question: e.target.value }))} />
						<LabeledInput label="Options (comma-separated)" value={contentValues.options?.join(', ') || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, options: e.target.value.split(',').map(s => s.trim()) }))} />
					</div>
				);
			case 'text_input':
				return (
					<div className="space-y-3">
						<LabeledInput label="Label" value={contentValues.label || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, label: e.target.value }))} />
						<LabeledInput label="Placeholder" value={contentValues.placeholder || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, placeholder: e.target.value }))} />
					</div>
				);
			case 'text_area':
				return (
					<div className="space-y-3">
						<LabeledInput label="Label" value={contentValues.label || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, label: e.target.value }))} />
						<LabeledInput label="Placeholder" value={contentValues.placeholder || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, placeholder: e.target.value }))} />
					</div>
				);
			case 'file_upload':
				return (
					<div className="space-y-3">
						<LabeledInput label="Label" value={contentValues.label || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, label: e.target.value }))} />
						<LabeledInput label="Accepted Types" value={contentValues.accepted_types?.join(', ') || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, accepted_types: e.target.value.split(',').map(s => s.trim()) }))} />
					</div>
				);
			case 'external_link':
				return (
					<div className="space-y-3">
						<LabeledInput label="Title" value={contentValues.title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, title: e.target.value }))} />
						<LabeledInput label="URL" value={contentValues.url || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, url: e.target.value }))} />
						<LabeledInput label="Description" value={contentValues.description || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, description: e.target.value }))} />
					</div>
				);
			case 'checklist':
				return (
					<div className="space-y-3">
						<LabeledInput label="Title" value={contentValues.title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, title: e.target.value }))} />
						<LabeledInput label="Items (comma-separated)" value={contentValues.items?.join(', ') || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, items: e.target.value.split(',').map(s => s.trim()) }))} />
					</div>
				);
			case 'caution':
				return (
					<div className="space-y-3">
						<LabeledInput label="Message" value={contentValues.message || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, message: e.target.value }))} />
					</div>
				);
			case 'list':
				return (
					<div className="space-y-3">
						<LabeledInput label="Items (comma-separated)" value={contentValues.items?.join(', ') || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, items: e.target.value.split(',').map(s => s.trim()) }))} />
					</div>
				);
			case 'date':
				return (
					<div className="space-y-3">
						<LabeledInput label="Label" value={contentValues.label || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, label: e.target.value }))} />
					</div>
				);
			case 'time_picker':
				return (
					<div className="space-y-3">
						<LabeledInput label="Label" value={contentValues.label || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, label: e.target.value }))} />
					</div>
				);
			case 'rating_scale':
				return (
					<div className="space-y-3">
						<LabeledInput label="Question" value={contentValues.question || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, question: e.target.value }))} />
					</div>
				);
			case 'visual_audio':
				return (
					<div className="space-y-3">
						<LabeledInput label="Title" value={contentValues.title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, title: e.target.value }))} />
						<LabeledInput label="Prompt" value={contentValues.prompt || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentValues((p: any) => ({ ...p, prompt: e.target.value }))} />
					</div>
				);
			default:
				return null;
		}
	}

	function mapToCreatePayload(): any {
		return {
			type,
			config: { required: configValues.required, display: { width: configValues.display?.width || 'full' } },
			content: { ...contentValues },
			order_index: orderIndex ?? null,
		};
	}

	function mapToUpdatePayload(): AnyUpdatePayload {
		const existing = blocks.find((b) => b.id === editingBlockId);
		const baseConfig = (existing as any)?.config || {};
		const mergedConfig = {
			...baseConfig,
			required: configValues.required,
			display: { ...(baseConfig.display || {}), width: configValues.display?.width || baseConfig.display?.width || 'full' },
		} as any;
		const baseContent = (existing as any)?.content || {};
		const mergedContent = { ...baseContent, ...contentValues } as any;

		// For specific content types, enhance with content values when available
		switch (type) {
			case 'header':
				if (contentValues.title && !mergedConfig.label) mergedConfig.label = contentValues.title;
				if (contentValues.subtitle && !mergedConfig.description) mergedConfig.description = contentValues.subtitle;
				break;
			case 'description':
				if (contentValues.title && !mergedConfig.label) mergedConfig.label = contentValues.title;
				break;
			case 'media':
				if (contentValues.alt_text && !mergedConfig.description) mergedConfig.description = contentValues.alt_text;
				break;
			case 'single_choice':
			case 'multiple_choice':
				if (contentValues.question && !mergedConfig.label) mergedConfig.label = contentValues.question;
				break;
			case 'text_input':
			case 'text_area':
				if (contentValues.label && !mergedConfig.label) mergedConfig.label = contentValues.label;
				if (contentValues.placeholder && !mergedConfig.description) mergedConfig.description = contentValues.placeholder;
				break;
			case 'file_upload':
				if (contentValues.label && !mergedConfig.label) mergedConfig.label = contentValues.label;
				if (contentValues.accepted_types && mergedConfig.upload) {
					mergedConfig.upload = { ...mergedConfig.upload, accepted_types: contentValues.accepted_types };
				}
				break;
			case 'external_link':
				if (contentValues.title && !mergedConfig.label) mergedConfig.label = contentValues.title;
				if (contentValues.description && !mergedConfig.description) mergedConfig.description = contentValues.description;
				break;
			case 'checklist':
				if (contentValues.title && !mergedConfig.label) mergedConfig.label = contentValues.title;
				break;
			case 'caution':
				if (contentValues.message && !mergedConfig.description) mergedConfig.description = contentValues.message;
				break;
			case 'date':
			case 'time_picker':
				if (contentValues.label && !mergedConfig.label) mergedConfig.label = contentValues.label;
				break;
			case 'rating_scale':
				if (contentValues.question && !mergedConfig.label) mergedConfig.label = contentValues.question;
				break;
			case 'visual_audio':
				if (contentValues.title && !mergedConfig.label) mergedConfig.label = contentValues.title;
				if (contentValues.prompt && !mergedConfig.description) mergedConfig.description = contentValues.prompt;
				break;
		}
		return {
			type: (existing as any)?.type as any,
			config: mergedConfig,
			content: mergedContent,
			order_index: orderIndex ?? (existing as any)?.order_index ?? null,
		} as AnyUpdatePayload;
	}

	async function handleSave() {
		try {
			if (!stageId || Array.isArray(stageId)) return;
			if (editingBlockId) {
				const payload = mapToUpdatePayload();
				await contentBlockService.updateContentBlock(editingBlockId, payload);
			} else {
				const payload = mapToCreatePayload();
				await contentBlockService.createContentBlock(stageId, payload);
			}
			setOpen(false);
			await load();
		} catch (e) {
			console.error('Failed to save content block', e);
		}
	}

	const typeOptions = useMemo(() => contentTypes.map((t) => t.name), [contentTypes]);

	if (!stage || isLoading) return <div>Loading...</div>;

	return (
		<div className="space-y-6">
			<div className="rounded-xl p-6 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 text-white shadow">
				<h1 className="text-2xl md:text-3xl font-bold">{stage.name}</h1>
				<p className="text-white/80 mt-1">Manage content blocks for this stage.</p>
			</div>

			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold flex items-center gap-2"><Layout className="h-5 w-5" /> Content Blocks</h2>
				<Button className="gap-2" onClick={openCreate}>
					<Plus className="h-4 w-4" /> Add Block
				</Button>
			</div>

			{blocks.length === 0 ? (
				<div className="text-center py-12 text-gray-500">No content blocks yet. Click "Add Block" to create one.</div>
			) : (
				<div className="space-y-4">
					<p className="text-sm text-gray-600">Drag and drop blocks to reorder them. The order will be automatically saved.</p>
					{blocks.map((block) => (
						<Card 
							key={block.id} 
							className={`hover:shadow-md transition-shadow cursor-move ${
								draggedBlockId === block.id ? 'opacity-50' : ''
							}`}
							draggable
							onDragStart={(e) => handleDragStart(e, block.id)}
							onDragOver={handleDragOver}
							onDrop={(e) => handleDrop(e, block.id)}
							onDragEnd={handleDragEnd}
						>
							<CardHeader>
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-center gap-2">
										<GripVertical className="h-4 w-4 text-gray-400" />
										<CardTitle className="text-lg">{block.type}</CardTitle>
									</div>
									<Badge variant="secondary">Order {block.order_index ?? '-'}</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<p className="text-sm text-gray-600 line-clamp-2">{(block as any)?.content?.title || (block as any)?.content?.question || (block as any)?.config?.title || 'No title provided'}</p>
								<div className="flex items-center gap-2">
									<Button variant="outline" size="sm" onClick={() => openEdit(block.id)}>Edit</Button>
									<Button variant="destructive" size="sm" onClick={() => handleDelete(block.id)}>Delete</Button>
								</div>
							</CardContent>
						</Card>
					))}
					{isReordering && (
						<div className="text-center py-4 text-sm text-gray-500">
							Saving new order...
						</div>
					)}
				</div>
			)}

			<div>
				<Link href={`/flows/${flowId}`} className="text-sm text-indigo-600 hover:underline">Back to Flow</Link>
			</div>

			{/* Sheet for create/edit */}
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent side="right" className="max-w-xl">
					<SheetHeader>
						<SheetTitle>{editingBlockId ? 'Edit Content Block' : 'Create Content Block'}</SheetTitle>
						<SheetDescription>Configure fields and settings based on content type.</SheetDescription>
					</SheetHeader>
					<div className="p-6 space-y-6">
						{/* Basics */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-medium text-gray-700">Type</label>
								<select value={type} onChange={(e) => resetByType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm">
									<option value="">Select type</option>
									{typeOptions.map((opt) => (
										<option key={opt} value={opt}>{opt}</option>
									))}
								</select>
							</div>
							<div>
								<LabeledInput label="Order Index" type="number" value={orderIndex ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderIndex(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g., 1" />
							</div>
						</div>

						{/* Content-specific fields */}
						<div>
							<h3 className="text-sm font-semibold text-gray-900 mb-2">Content</h3>
							{renderContentFields()}
						</div>

						{/* Basic settings */}
						<div>
							<h3 className="text-sm font-semibold text-gray-900 mb-2">Settings</h3>
							<SettingsSection />
						</div>
					</div>
					<SheetFooter>
						<Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
						<Button onClick={handleSave}>{editingBlockId ? 'Save Changes' : 'Create Block'}</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
}
