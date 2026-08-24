import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import ServiceCard from "@/components/ServiceCard";
import CTAButton from "@/components/CTAButton";
import { FALLBACK_SERVICES } from "@/lib/siteData";
import { HOME_DEFAULTS } from "@/lib/sitePageDefaults";
export default function ServicesOverview({ content = HOME_DEFAULTS }) { const [services,setServices]=useState(FALLBACK_SERVICES); useEffect(()=>{(async()=>{try{const data=await base44.entities.Service.list("display_order",20);if(data?.length)setServices(data);}catch(e){}})();},[]); return <section className="py-20 lg:py-28 bg-slate-50/50"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><Reveal><SectionHeader eyebrow={content.services_eyebrow} title={content.services_title} subtitle={content.services_subtitle}/></Reveal><div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{services.map((service,i)=><Reveal key={service.slug||i} delay={i*60}><ServiceCard service={service}/></Reveal>)}</div><Reveal className="mt-12 text-center"><CTAButton to="/services" variant="dark" size="lg">{content.services_cta}</CTAButton></Reveal></div></section>; }
