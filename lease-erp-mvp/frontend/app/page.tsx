import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Leasing ERP
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive SaaS ERP system for vehicle and equipment leasing management
          </p>

          <div className="flex gap-4 justify-center mb-12">
            <Link href="/api/auth/login">
              <Button size="lg">
                Get Started
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                View Dashboard
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">CRM</h3>
              <p className="text-sm text-muted-foreground">
                Manage leads, customers, and opportunities
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Quotes</h3>
              <p className="text-sm text-muted-foreground">
                Generate quotes with calculation engine
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Contracts</h3>
              <p className="text-sm text-muted-foreground">
                Manage contract lifecycle end-to-end
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Assets</h3>
              <p className="text-sm text-muted-foreground">
                Track and manage your fleet & equipment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
