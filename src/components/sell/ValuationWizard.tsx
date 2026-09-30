'use client';

import { useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import {
  ArrowLeft, ArrowRight, CheckCircle, Phone, WhatsappLogo,
} from '@phosphor-icons/react';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';
import { CATALAN_MUNICIPALITIES } from '@/data/catalanMunicipalities';
import { normalize } from '@/lib/utils';
import { track, getAttribution } from '@/lib/track';
import {
  CONDITIONS, EXTRAS, PROPERTY_TYPES, TIMINGS,
  type ConditionKey, type ExtraKey, type PropertyTypeKey, type TimingKey,
} from '@/lib/valuationOptions';

interface Estimate {
  min: number;
  max: number;
  pricePerM2: number;
  comparables: number;
  basis: 'municipio' | 'comarca';
}

const STEPS = ['Ubicación', 'Tu inmueble', 'Contacto'] as const;

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const inputClass =
  'w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-[15px] text-[var(--dark)] placeholder:text-[var(--subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--rose)]';
const labelClass = 'mb-2 block text-[13px] text-[var(--mid)]';

function officialCity(value: string): string | undefined {
  const q = normalize(value);
  return CATALAN_MUNICIPALITIES.find((m) => normalize(m) === q);
}

/** Grupo de opciones tipo píldora (radio o checkbox accesibles) */
function Pills<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  multiple = false,
}: {
  name: string;
  legend: string;
  options: readonly (readonly [T, string])[];
  value: T | T[] | '';
  onChange: (v: T) => void;
  multiple?: boolean;
}) {
  const selected = (key: T) => (Array.isArray(value) ? value.includes(key) : value === key);
  return (
    <fieldset>
      <legend className={labelClass}>{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([key, label]) => (
          <label key={key} className="cursor-pointer">
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name}
              value={key}
              checked={selected(key)}
              onChange={() => onChange(key)}
              className="peer sr-only"
            />
            <span className="block whitespace-nowrap rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-[14px] text-[var(--dark)] transition-colors hover:border-[var(--accent)] peer-checked:border-[var(--dark)] peer-checked:bg-[var(--dark)] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--rose)]">
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function ValuationWizard({ defaultCity = '' }: { defaultCity?: string }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const started = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  const [city, setCity] = useState(defaultCity);
  const [address, setAddress] = useState('');
  const [type, setType] = useState<PropertyTypeKey | ''>('');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [condition, setCondition] = useState<ConditionKey | ''>('');
  const [extras, setExtras] = useState<ExtraKey[]>([]);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [timing, setTiming] = useState<TimingKey | ''>('');
  const [privacidad, setPrivacidad] = useState(false);
  const honeypot = useRef<HTMLInputElement>(null);

  function markStarted() {
    if (!started.current) {
      started.current = true;
      track('valuation_start');
    }
  }

  function validate(current: number): string | null {
    if (current === 0 && !officialCity(city)) return 'Elige el municipio de la lista.';
    if (current === 1) {
      if (!type) return 'Indica el tipo de inmueble.';
      const m2 = Number(area);
      if (!m2 || m2 < 15 || m2 > 2000) return 'Indica la superficie en m² (entre 15 y 2.000).';
      if (bedrooms === '') return 'Indica cuántas habitaciones tiene.';
      if (!bathrooms) return 'Indica cuántos baños tiene.';
      if (!condition) return 'Indica el estado del inmueble.';
    }
    if (current === 2) {
      if (!nombre.trim()) return 'Escribe tu nombre.';
      if (telefono.replace(/\D/g, '').length < 9) return 'Escribe un teléfono válido para poder llamarte.';
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El email no es válido.';
      if (!timing) return 'Dinos cuándo te planteas vender.';
      if (!privacidad) return 'Necesitamos que aceptes la política de privacidad.';
    }
    return null;
  }

  function goTo(next: number) {
    setError(null);
    setStep(next);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function handleNext(e: React.FormEvent) {
    e.preventDefault();
    markStarted();
    const problem = validate(step);
    if (problem) {
      setError(problem);
      return;
    }
    if (step < STEPS.length - 1) {
      track('valuation_step', { step: step + 2 });
      goTo(step + 1);
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: officialCity(city),
          address,
          type,
          area: Number(area),
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          condition,
          extras,
          timing,
          nombre,
          telefono,
          email,
          privacidad,
          empresa_web: honeypot.current?.value ?? '',
          _attribution: getAttribution(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'No se pudo enviar. Llámanos o escríbenos por WhatsApp.');
        setStatus('idle');
        return;
      }
      setEstimate(data.estimate ?? null);
      setStatus('done');
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch {
      setError('No se pudo enviar. Llámanos o escríbenos por WhatsApp.');
      setStatus('idle');
    }
  }

  const cityName = officialCity(city) ?? city;

  if (status === 'done') {
    return (
      <div ref={topRef} className="animate-fade-in rounded-[var(--radius-panel)] bg-white p-7 md:p-10" style={{ boxShadow: 'var(--shadow-soft)' }}>
        <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--rose-soft)] text-[var(--accent)]">
          <CheckCircle size={28} weight="light" />
        </span>
        {estimate ? (
          <>
            <p className="mb-2 text-[14px] text-[var(--mid)]">Valor orientativo de tu inmueble en {cityName}</p>
            <p className="font-figures mb-4 font-normal leading-none" style={{ fontSize: 'clamp(28px, 3.2vw, 42px)' }}>
              {eur(estimate.min)} - {eur(estimate.max)}
            </p>
            <p className="mb-8 max-w-[56ch] text-[14px] leading-[1.7] text-[var(--mid)]">
              Calculado con {estimate.comparables} inmuebles comparables {estimate.basis === 'municipio' ? `en ${cityName}` : 'de la comarca'}.
              Es una aproximación: orientación, altura, reformas y estado de la finca pueden mover el precio.
              Te llamamos en menos de 24 horas para darte una valoración precisa, sin compromiso.
            </p>
          </>
        ) : (
          <>
            <h3 className="font-display mb-3 text-[34px] font-light leading-[1.1]">Solicitud recibida, {nombre.split(' ')[0]}</h3>
            <p className="mb-8 max-w-[56ch] text-[15px] leading-[1.7] text-[var(--mid)]">
              En {cityName} preferimos valorar cada inmueble a mano con datos de ventas reales de la zona.
              Te llamamos en menos de 24 horas con una valoración precisa, sin compromiso.
            </p>
          </>
        )}
        <div className="flex flex-wrap gap-3">
          <a href="tel:+34691294443" className="btn btn-primary">
            <Phone size={17} weight="light" />
            Llamar ahora
          </a>
          <a href="https://wa.me/34691294443" target="_blank" rel="noopener noreferrer" className="btn bg-[#1f9d55] text-white hover:bg-[#188a49]">
            <WhatsappLogo size={18} weight="fill" />
            WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="rounded-[var(--radius-panel)] bg-white p-6 md:p-10" style={{ boxShadow: 'var(--shadow-soft)' }}>
      {/* Progreso */}
      <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Progreso">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? 'step' : undefined}>
            <span
              className="mb-2 block h-1.5 rounded-full transition-colors duration-500"
              style={{ background: i <= step ? 'var(--accent)' : 'var(--bg2)' }}
            />
            <span className={`text-[12px] ${i === step ? 'text-[var(--dark)]' : 'text-[var(--subtle)]'}`}>{label}</span>
          </li>
        ))}
      </ol>

      <form onSubmit={handleNext} onChange={() => { markStarted(); setError(null); }} noValidate className="relative">
        <input ref={honeypot} type="text" name="empresa_web" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0" />

        {step === 0 && (
          <div className="animate-fade-in space-y-6">
            <h3 className="font-display text-[30px] font-light leading-[1.1]">¿Dónde está tu vivienda?</h3>
            <div>
              <label htmlFor="val-city" className={labelClass}>Municipio</label>
              <LocationAutocomplete
                id="val-city"
                name="city"
                defaultValue={city}
                placeholder="Empieza a escribir: Mollet, Sabadell..."
                onValueChange={(v) => {
                  markStarted();
                  setCity(v);
                }}
                inputClassName={inputClass}
              />
            </div>
            <div>
              <label htmlFor="val-address" className={labelClass}>
                Calle y número <span className="text-[var(--subtle)]">(opcional)</span>
              </label>
              <input id="val-address" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} autoComplete="street-address" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <h3 className="font-display text-[30px] font-light leading-[1.1]">Cuéntanos cómo es</h3>
            <Pills name="type" legend="Tipo de inmueble" options={Object.entries(PROPERTY_TYPES) as [PropertyTypeKey, string][]} value={type} onChange={setType} />
            <div className="max-w-[220px]">
              <label htmlFor="val-area" className={labelClass}>Superficie construida (m²)</label>
              <input id="val-area" type="number" inputMode="numeric" min={15} max={2000} value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} />
            </div>
            <Pills
              name="bedrooms"
              legend="Habitaciones"
              options={[['0', 'Estudio'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5 o más']] as const}
              value={bedrooms}
              onChange={setBedrooms}
            />
            <Pills name="bathrooms" legend="Baños" options={[['1', '1'], ['2', '2'], ['3', '3 o más']] as const} value={bathrooms} onChange={setBathrooms} />
            <Pills
              name="condition"
              legend="Estado"
              options={Object.entries(CONDITIONS).map(([k, v]) => [k as ConditionKey, v.label] as const)}
              value={condition}
              onChange={setCondition}
            />
            <Pills
              name="extras"
              legend="Extras (marca los que tenga)"
              multiple
              options={Object.entries(EXTRAS).map(([k, v]) => [k as ExtraKey, v.label] as const)}
              value={extras}
              onChange={(key) => setExtras((prev) => (prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]))}
            />
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <h3 className="font-display text-[30px] font-light leading-[1.1]">¿A quién le damos la valoración?</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="val-name" className={labelClass}>Nombre</label>
                <input id="val-name" value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClass} autoComplete="name" />
              </div>
              <div>
                <label htmlFor="val-phone" className={labelClass}>Teléfono</label>
                <input id="val-phone" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={inputClass} autoComplete="tel" />
              </div>
            </div>
            <div>
              <label htmlFor="val-email" className={labelClass}>
                Email <span className="text-[var(--subtle)]">(opcional, para enviarte la valoración por escrito)</span>
              </label>
              <input id="val-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="email" />
            </div>
            <Pills name="timing" legend="¿Cuándo te planteas vender?" options={Object.entries(TIMINGS) as [TimingKey, string][]} value={timing} onChange={setTiming} />
            <label className="flex items-start gap-3 text-[13px] leading-relaxed text-[var(--mid)]">
              <input type="checkbox" checked={privacidad} onChange={(e) => setPrivacidad(e.target.checked)} className="mt-1 accent-[var(--accent)]" />
              <span>
                He leído y acepto la{' '}
                <Link href="/privacidad" className="underline underline-offset-2" style={{ color: 'var(--accent)' }}>
                  política de privacidad
                </Link>
                . Usaremos tus datos solo para gestionar esta valoración.
              </span>
            </label>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-6 rounded-[var(--radius-input)] bg-red-50 px-4 py-3 text-[14px] text-red-800">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={() => goTo(step - 1)} className="btn text-[var(--dark)]" style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}>
              <ArrowLeft size={16} />
              Atrás
            </button>
          ) : (
            <span />
          )}
          <button type="submit" disabled={status === 'sending'} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60">
            {step < STEPS.length - 1 ? 'Continuar' : status === 'sending' ? 'Calculando...' : 'Ver mi valoración'}
            {status !== 'sending' && <ArrowRight size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}
