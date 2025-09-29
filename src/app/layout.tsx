import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="bg-gray-50">
				<AuthProvider>
					{children}
				</AuthProvider>
			</body>
		</html>
	);
}