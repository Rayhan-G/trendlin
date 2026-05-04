// app/[slug]/page.js (SSG + ISR)
import { supabaseReader } from '@/lib/supabase'
import AdDisplay from '@/components/ads/AdDisplay'
import { notFound } from 'next/navigation'

// Generate static pages for popular content
export async function generateStaticParams() {
  const { data } = await supabaseReader
    .from('contents')
    .select('slug')
    .eq('is_published', true)
    .limit(100)
  
  return data?.map(content => ({ slug: content.slug })) || []
}

// ISR - revalidate every hour
export const revalidate = 3600

export default async function ContentPage({ params }) {
  const { slug } = params
  
  // Fetch from read replica
  const { data: content, error } = await supabaseReader
    .from('contents')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  
  if (error || !content) {
    notFound()
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Ad */}
      <AdDisplay slotId="header-slot" position="header" />
      
      <article className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
          
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
          
          {/* In-content Ad */}
          <AdDisplay slotId="in-content-slot" position="in_content" />
        </div>
        
        {/* Sidebar with Ad */}
        <aside className="lg:col-span-1">
          <AdDisplay slotId="sidebar-slot" position="sidebar" />
        </aside>
      </article>
      
      {/* Footer Ad */}
      <AdDisplay slotId="footer-slot" position="footer" />
    </div>
  )
}