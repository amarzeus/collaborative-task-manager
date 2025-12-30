/**
 * Component Showcase Page
 * Displays all UI components for development reference
 */

import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import {
    CheckCircle,
    AlertCircle,
    Info,
    Star,
    Plus,
    Search
} from 'lucide-react';

export function ComponentShowcase() {
    const [inputValue, setInputValue] = useState('');

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <div className="max-w-4xl mx-auto space-y-12">
                <header>
                    <h1 className="text-3xl font-bold text-white mb-2">Component Library</h1>
                    <p className="text-slate-400">TaskFlow UI component reference</p>
                </header>

                {/* Buttons Section */}
                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">Buttons</h2>
                    <Card className="p-6 bg-slate-800/50">
                        <div className="flex flex-wrap gap-4">
                            <Button variant="primary">Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="danger">Danger</Button>
                            <Button variant="primary" disabled>Disabled</Button>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4">
                            <Button variant="primary" size="sm">Small</Button>
                            <Button variant="primary" size="md">Medium</Button>
                            <Button variant="primary" size="lg">Large</Button>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4">
                            <Button variant="primary" leftIcon={<Plus size={16} />}>With Icon</Button>
                            <Button variant="secondary" rightIcon={<Star size={16} />}>Right Icon</Button>
                        </div>
                    </Card>
                </section>

                {/* Inputs Section */}
                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">Inputs</h2>
                    <Card className="p-6 bg-slate-800/50 space-y-4">
                        <Input
                            label="Default Input"
                            placeholder="Enter text..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <Input
                            label="With Icon"
                            placeholder="Search..."
                            leftIcon={<Search size={16} />}
                        />
                        <Input
                            label="With Error"
                            placeholder="Invalid input"
                            error="This field is required"
                        />
                        <Input
                            label="Disabled"
                            placeholder="Cannot edit"
                            disabled
                        />
                    </Card>
                </section>

                {/* Cards Section */}
                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-6 bg-slate-800/50">
                            <h3 className="text-lg font-medium text-white mb-2">Default Card</h3>
                            <p className="text-slate-400">Standard card with content</p>
                        </Card>
                        <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30">
                            <h3 className="text-lg font-medium text-white mb-2">Gradient Card</h3>
                            <p className="text-slate-400">With gradient background</p>
                        </Card>
                    </div>
                </section>

                {/* Status Indicators */}
                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">Status Indicators</h2>
                    <Card className="p-6 bg-slate-800/50">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle size={20} /> Success
                            </div>
                            <div className="flex items-center gap-2 text-red-400">
                                <AlertCircle size={20} /> Error
                            </div>
                            <div className="flex items-center gap-2 text-blue-400">
                                <Info size={20} /> Info
                            </div>
                            <div className="flex items-center gap-2 text-yellow-400">
                                <Star size={20} /> Warning
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Color Palette */}
                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">Color Palette</h2>
                    <Card className="p-6 bg-slate-800/50">
                        <div className="grid grid-cols-5 gap-2">
                            <div className="h-12 rounded bg-indigo-500 flex items-center justify-center text-xs text-white">indigo</div>
                            <div className="h-12 rounded bg-purple-500 flex items-center justify-center text-xs text-white">purple</div>
                            <div className="h-12 rounded bg-green-500 flex items-center justify-center text-xs text-white">green</div>
                            <div className="h-12 rounded bg-red-500 flex items-center justify-center text-xs text-white">red</div>
                            <div className="h-12 rounded bg-yellow-500 flex items-center justify-center text-xs text-white">yellow</div>
                        </div>
                    </Card>
                </section>

            </div>
        </div>
    );
}
