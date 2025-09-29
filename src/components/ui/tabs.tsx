import * as React from 'react'
import { cn } from '@/lib/utils'

export function Tabs({ defaultValue, className, children }: { defaultValue: string, className?: string, children: React.ReactNode }) {
	const [value, setValue] = React.useState(defaultValue)
	return (
		<div className={cn('w-full', className)}>
			{React.Children.map(children, (child: any) => React.cloneElement(child, { value, setValue }))}
		</div>
	)
}

export function TabsList({ children, value, setValue }: any) {
	return (
		<div className="inline-flex rounded-lg border bg-white p-1 shadow-sm">
			{React.Children.map(children, (child: any) => React.cloneElement(child, { value, setValue }))}
		</div>
	)
}

export function TabsTrigger({ value: tabValue, children, value, setValue }: any) {
	const active = value === tabValue
	return (
		<button onClick={() => setValue(tabValue)} className={cn('px-3 py-1.5 text-sm rounded-md transition-colors', active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100')}>
			{children}
		</button>
	)
}

export function TabsContent({ value: tabValue, children, value }: any) {
	if (value !== tabValue) return null
	return <div>{children}</div>
}
