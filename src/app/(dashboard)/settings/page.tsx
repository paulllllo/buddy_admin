'use client';

import { useEffect, useState } from 'react';
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
import { companyService } from '@/lib/services/company';
import { CompanyResponse, CompanyUpdate } from '@/lib/api/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
	name: z.string().min(1, { message: 'Company name is required.' }),
	description: z.string().optional(),
	industry: z.string().optional(),
	website: z.string().url({ message: 'Invalid URL.' }).optional(),
});

export default function SettingsPage() {
	const [company, setCompany] = useState<CompanyResponse | null>(null);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	useEffect(() => {
		async function fetchCompanyInfo() {
			try {
				const data = await companyService.getCompanyInfo();
				setCompany(data);
				form.reset({
					name: data.name,
					description: data.description ?? undefined,
					industry: data.industry ?? undefined,
					website: data.website ?? undefined,
				});
			} catch (error) {
				console.error('Failed to fetch company info:', error);
			}
		}
		fetchCompanyInfo();
	}, [form]);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			await companyService.updateCompanyInfo(values as CompanyUpdate);
		} catch (error) {
			console.error('Failed to update company info:', error);
		}
	}

	if (!company) {
		return <div>Loading...</div>;
	}

	return (
		<div className="space-y-6">
			<div className="rounded-xl p-6 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 text-white shadow">
				<h1 className="text-2xl md:text-3xl font-bold">Company Settings</h1>
				<p className="text-white/80 mt-1">Manage your company profile and preferences.</p>
			</div>

			<Tabs defaultValue="profile" className="w-full">
				<TabsList>
					<TabsTrigger value="profile">Company Profile</TabsTrigger>
					<TabsTrigger value="branding">Branding</TabsTrigger>
					<TabsTrigger value="account">Account</TabsTrigger>
				</TabsList>

				<TabsContent value="profile" className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Profile</CardTitle>
						</CardHeader>
						<CardContent>
							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Company Name</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="industry"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Industry</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="website"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Website</FormLabel>
												<FormControl>
													<Input {...field} />
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
				</TabsContent>

				<TabsContent value="branding" className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Branding</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-600">Branding configuration coming soon.</p>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="account" className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Account</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-600">Manage account settings and preferences.</p>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}