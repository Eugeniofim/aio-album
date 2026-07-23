/**
 * Press Page — AÍO Album Press Kit
 * Design: Aquatic Minimalism — Professional press materials
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { albumData, PRESS_DATA } from '@/lib/albumData';
import { Copy, Download, Mail, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Press() {
  const [copied, setCopied] = useState(false);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Texto copiado para a área de transferência');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <a href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
              AÍO
            </a>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Voltar
            </a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contato
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
            <div className="flex justify-center md:justify-start">
              <img
                src={albumData.coverImage}
                alt={albumData.title}
                className="w-full max-w-sm rounded-lg shadow-2xl"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-2">AÍO</h1>
                <p className="subtitle text-primary">{albumData.subtitle}</p>
              </div>

              <p className="text-lg text-foreground/80 leading-relaxed">
                {PRESS_DATA.releaseText}
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-primary text-primary-foreground hover:bg-accent"
                  asChild
                >
                  <a href="/">
                    Ouvir Álbum
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => handleCopyText(PRESS_DATA.releaseText)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Release
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Press Kit Accordion */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Kit de Imprensa</h2>

          <Accordion type="single" collapsible className="space-y-4">
            {/* Release */}
            <AccordionItem value="release" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="hover:text-primary transition-colors">
                <span className="text-lg font-semibold">Release Oficial</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-foreground/80 leading-relaxed">{PRESS_DATA.releaseText}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-primary font-semibold">Lançamento</p>
                    <p className="text-foreground/70">{PRESS_DATA.releaseDate}</p>
                  </div>
                  <div>
                    <p className="text-primary font-semibold">Gênero</p>
                    <p className="text-foreground/70">{PRESS_DATA.genre}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => handleCopyText(PRESS_DATA.releaseText)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Texto
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* Tracklist */}
            <AccordionItem value="tracklist" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="hover:text-primary transition-colors">
                <span className="text-lg font-semibold">Tracklist</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {albumData.tracks.map((track) => (
                    <div key={track.id} className="flex items-center justify-between pb-3 border-b border-border last:border-b-0">
                      <div>
                        <p className="font-semibold text-foreground">{track.title}</p>
                        <p className="text-sm text-muted-foreground">{track.composer}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{track.duration}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Musicians */}
            <AccordionItem value="musicians" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="hover:text-primary transition-colors">
                <span className="text-lg font-semibold">Os Músicos</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6">
                {albumData.musicians.map((musician) => (
                  <div key={musician.id} className="pb-6 border-b border-border last:border-b-0">
                    <div className="flex gap-4 mb-3">
                      <img
                        src={musician.photo}
                        alt={musician.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="text-lg font-bold text-foreground">{musician.name}</h4>
                        <p className="text-primary font-semibold text-sm mb-2">{musician.role}</p>
                        <p className="text-sm text-foreground/70">{musician.bio}</p>
                      </div>
                    </div>
                    {musician.website && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/10"
                        asChild
                      >
                        <a href={musician.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {musician.website}
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            {/* Technical Rider */}
            <AccordionItem value="rider" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="hover:text-primary transition-colors">
                <span className="text-lg font-semibold">Rider Técnico</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Áudio</h4>
                  <p className="text-sm text-foreground/70">{PRESS_DATA.riders.audio}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Instrumentos</h4>
                  <p className="text-sm text-foreground/70">{PRESS_DATA.riders.instruments}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Setup de Palco</h4>
                  <p className="text-sm text-foreground/70">{PRESS_DATA.riders.setup}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Duração</h4>
                  <p className="text-sm text-foreground/70">{PRESS_DATA.riders.duration}</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Downloads */}
            <AccordionItem value="downloads" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="hover:text-primary transition-colors">
                <span className="text-lg font-semibold">Downloads</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm text-foreground/70">Fotos e materiais para imprensa:</p>
                  <div className="flex flex-wrap gap-2">
                    {albumData.musicians.map((musician) => (
                      <Button
                        key={musician.id}
                        variant="outline"
                        size="sm"
                        className="border-primary text-primary hover:bg-primary/10"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {musician.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-foreground/70 mb-2">Capa do álbum:</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Capa Alta Resolução
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24">
        <div className="container max-w-2xl">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Entre em Contato</h2>
            <p className="text-foreground/80 mb-6 leading-relaxed">
              Para informações de imprensa, entrevistas, parcerias ou qualquer outra solicitação relacionada ao álbum AÍO, entre em contato conosco.
            </p>

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-accent"
                asChild
              >
                <a href={`mailto:${PRESS_DATA.contact}`}>
                  <Mail className="w-5 h-5 mr-2" />
                  {PRESS_DATA.contact}
                </a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10"
                asChild
              >
                <a href="/">
                  Voltar para o Álbum
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 border-t border-border py-8 mt-16">
        <div className="container text-center text-sm text-foreground/60">
          <p>© 2026 AÍO. Todos os direitos reservados.</p>
          <p className="mt-2">Produção: Eugênio Fim · Participação: Vina Lacerda, Daniel Migliavacca</p>
        </div>
      </footer>
    </div>
  );
}
