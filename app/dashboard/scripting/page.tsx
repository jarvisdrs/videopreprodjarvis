'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Wand2, Download, Save, FileText, Sparkles } from 'lucide-react'

export default function ScriptingPage() {
  const [prompt, setPrompt] = useState('')
  const [outline, setOutline] = useState('')
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'outline' | 'script'>('outline')

  const generateOutline = async () => {
    if (!prompt.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'outline',
          prompt: prompt,
        }),
      })
      
      const data = await response.json()
      if (data.content) {
        setOutline(data.content)
        setActiveTab('outline')
      }
    } catch (error) {
      console.error('Error generating outline:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateScript = async () => {
    if (!outline.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'script',
          outline: outline,
        }),
      })
      
      const data = await response.json()
      if (data.content) {
        setScript(data.content)
        setActiveTab('script')
      }
    } catch (error) {
      console.error('Error generating script:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportScript = () => {
    const content = activeTab === 'outline' ? outline : script
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Scripting</h1>
        <p className="text-muted-foreground">
          Generate video scripts and outlines using AI.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate Outline
              </CardTitle>
              <CardDescription>
                Enter a topic or description to generate a video outline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="E.g., A 3-minute explainer video about our new SaaS product for small businesses..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={generateOutline} 
                disabled={loading || !prompt.trim()}
                className="w-full"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {loading && activeTab === 'outline' ? 'Generating...' : 'Generate Outline'}
              </Button>
            </CardContent>
          </Card>

          {outline && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Expand to Full Script
                </CardTitle>
                <CardDescription>
                  Generate a complete script from your outline.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateScript} 
                  disabled={loading || !outline.trim()}
                  variant="secondary"
                  className="w-full"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {loading && activeTab === 'script' ? 'Generating...' : 'Generate Full Script'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Editor</CardTitle>
                <CardDescription>
                  {activeTab === 'outline' ? 'Edit your outline' : 'Edit your script'}
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                {(outline || script) && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab(activeTab === 'outline' ? 'script' : 'outline')}
                      disabled={activeTab === 'script' && !script}
                    >
                      {activeTab === 'outline' ? 'View Script' : 'View Outline'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportScript}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1">
            <Textarea
              value={activeTab === 'outline' ? outline : script}
              onChange={(e) => {
                if (activeTab === 'outline') {
                  setOutline(e.target.value)
                } else {
                  setScript(e.target.value)
                }
              }}
              placeholder={activeTab === 'outline' 
                ? 'Your outline will appear here...' 
                : 'Your script will appear here...'
              }
              className="min-h-[400px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
