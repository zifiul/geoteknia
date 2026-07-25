'use client';

import { useState } from 'react';

import {
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Grid,
  Input,
  LinkButton,
  ProgressBar,
  Radio,
  Section,
  Select,
  Skeleton,
  Textarea,
} from '@/components/atoms';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  Breadcrumbs,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  FieldError,
  FormField,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/molecules';
import { StickyCtaBar } from '@/components/organisms';

export function DevComponentesCatalog() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Container className="pb-24 pt-8">
      <header className="mb-10 space-y-2">
        <h1 className="text-headline-md font-semibold text-brand-on-surface">
          Catálogo de componentes (GTK-44)
        </h1>
        <p className="text-brand-secondary">
          Revisión visual interna — no indexable.
        </p>
        <Breadcrumbs
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Componentes' },
          ]}
        />
      </header>

      <Grid cols={2} className="mb-12">
        <Card>
          <h2 className="mb-4 text-headline-sm font-semibold">Button</h2>
          <div className="flex flex-wrap gap-2">
            <Button>Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="outline">Outline</Button>
            <Button loading>Cargando</Button>
            <Button disabled>Deshabilitado</Button>
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-headline-sm font-semibold">LinkButton</h2>
          <LinkButton href="/">Enlace CTA</LinkButton>
        </Card>
        <Card>
          <h2 className="mb-4 text-headline-sm font-semibold">Badge y Alert</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="success">Éxito</Badge>
            <Badge variant="error">Error</Badge>
          </div>
          <Alert title="Información">Mensaje informativo.</Alert>
        </Card>
        <Card>
          <h2 className="mb-4 text-headline-sm font-semibold">Skeleton / Progress</h2>
          <Skeleton className="mb-4 h-8 w-full" />
          <ProgressBar value={65} label="Avance de ejemplo" />
        </Card>
      </Grid>

      <Section className="border-t border-brand-secondary/10 pt-8">
        <h2 className="mb-6 text-headline-sm font-semibold">Formularios</h2>
        <Grid cols={2}>
          <FormField id="demo-email" label="Email" required hint="Texto de ayuda">
            <Input
              id="demo-email"
              type="email"
              placeholder="tu@empresa.com"
              aria-describedby="demo-email-hint demo-email-error"
              aria-invalid="true"
            />
            <FieldError id="demo-email-error">Introduce un email válido.</FieldError>
          </FormField>
          <div className="space-y-4">
            <Textarea placeholder="Mensaje" aria-label="Mensaje" />
            <Select aria-label="Servicio" defaultValue="">
              <option value="" disabled>
                Selecciona…
              </option>
              <option value="estudio">Estudio geotécnico</option>
            </Select>
            <Checkbox name="legal" label="Acepto la política de privacidad" />
            <Radio name="urgencia" value="normal" label="Plazo estándar" defaultChecked />
            <Radio name="urgencia" value="urgente" label="Urgente" />
          </div>
        </Grid>
      </Section>

      <Section className="border-t border-brand-secondary/10">
        <h2 className="mb-6 text-headline-sm font-semibold">Overlays</h2>
        <div className="flex flex-wrap gap-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" data-testid="open-dialog">
                Abrir diálogo
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="dialog-desc">
              <DialogTitle>Diálogo de ejemplo</DialogTitle>
              <DialogDescription id="dialog-desc">
                Focus trap y cierre con Escape.
              </DialogDescription>
              <Button type="button" className="mt-4" onClick={() => setDialogOpen(false)}>
                Cerrar
              </Button>
            </DialogContent>
          </Dialog>

          <Accordion type="single" collapsible className="w-full max-w-md">
            <AccordionItem value="item-1">
              <AccordionTrigger>¿Qué incluye el estudio?</AccordionTrigger>
              <AccordionContent>
                Sondeo, ensayos de laboratorio e informe firmado.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <Tabs defaultValue="tab-1" className="mt-8 max-w-md">
          <TabsList aria-label="Pestañas de ejemplo">
            <TabsTrigger value="tab-1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab-2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab-1">Contenido pestaña 1</TabsContent>
          <TabsContent value="tab-2">Contenido pestaña 2</TabsContent>
        </Tabs>
      </Section>

      <StickyCtaBar>
        <Button className="w-full sm:w-auto">Solicitar presupuesto</Button>
      </StickyCtaBar>
    </Container>
  );
}
