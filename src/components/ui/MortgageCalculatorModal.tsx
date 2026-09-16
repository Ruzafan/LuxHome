'use client';

import { useState, useEffect } from 'react';

export default function MortgageCalculatorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [price, setPrice] = useState<number>(350000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [years, setYears] = useState<number>(25);
  const [interestRate, setInterestRate] = useState<number>(3.25);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.price) {
        setPrice(Number(customEvent.detail.price));
      }
      setIsOpen(true);
    };

    window.addEventListener('open_mortgage_calculator', handleOpen);
    return () => window.removeEventListener('open_mortgage_calculator', handleOpen);
  }, []);

  if (!isOpen) return null;

  const downPayment = Math.round(price * (downPaymentPercent / 100));
  const loanAmount = Math.max(0, price - downPayment);
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = years * 12;

  let monthlyPayment = 0;
  if (monthlyRate > 0 && loanAmount > 0) {
    monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  } else if (loanAmount > 0) {
    monthlyPayment = loanAmount / totalMonths;
  }

  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = Math.max(0, totalPayment - loanAmount);
  const estimatedExpenses = Math.round(price * 0.12); // ~10% ITP + 2% notaría/gestoría en Catalunya

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
        {/* Header */}
        <div className="p-6 bg-[var(--dark)] text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] text-[var(--gold)] uppercase block mb-1">
              Simulador Financiero
            </span>
            <h2 className="text-2xl font-light font-playfair">Calculadora Hipotecaria</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[75vh] no-scrollbar">
          {/* Result Card */}
          <div className="p-6 rounded-2xl luxury-gradient text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            <div>
              <span className="text-xs font-medium uppercase tracking-widest text-white/70 block mb-1">
                Cuota mensual estimada
              </span>
              <span className="text-4xl md:text-5xl font-light font-playfair tracking-tight text-[var(--gold-light)]">
                {Math.round(monthlyPayment).toLocaleString('es-ES')} €<span className="text-sm text-white/70 font-sans">/mes</span>
              </span>
            </div>
            <div className="text-right border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6 w-full md:w-auto">
              <p className="text-xs text-white/70">Financiación: <strong className="text-white">{loanAmount.toLocaleString('es-ES')} €</strong></p>
              <p className="text-xs text-white/70">Gastos aprox. (ITP+Gestoría): <strong className="text-white">{estimatedExpenses.toLocaleString('es-ES')} €</strong></p>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-5">
            {/* Price slider */}
            <div>
              <div className="flex justify-between text-sm font-medium mb-1.5 text-gray-700">
                <span>Precio de la propiedad</span>
                <span className="font-bold text-[var(--dark)]">{price.toLocaleString('es-ES')} €</span>
              </div>
              <input
                type="range"
                min={50000}
                max={2000000}
                step={10000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
            </div>

            {/* Down payment slider */}
            <div>
              <div className="flex justify-between text-sm font-medium mb-1.5 text-gray-700">
                <span>Entrada inicial ({downPaymentPercent}%)</span>
                <span className="font-bold text-[var(--dark)]">{downPayment.toLocaleString('es-ES')} €</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
            </div>

            {/* Tenure slider */}
            <div>
              <div className="flex justify-between text-sm font-medium mb-1.5 text-gray-700">
                <span>Plazo de amortización</span>
                <span className="font-bold text-[var(--dark)]">{years} años</span>
              </div>
              <input
                type="range"
                min={10}
                max={30}
                step={5}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
            </div>

            {/* Interest rate slider */}
            <div>
              <div className="flex justify-between text-sm font-medium mb-1.5 text-gray-700">
                <span>Tipo de interés anual (TIN)</span>
                <span className="font-bold text-[var(--dark)]">{interestRate}%</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={7.0}
                step={0.25}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="p-4 bg-gray-50 rounded-xl text-xs space-y-1.5 text-gray-600">
            <div className="flex justify-between">
              <span>Total de intereses a pagar:</span>
              <span className="font-semibold text-gray-900">{Math.round(totalInterest).toLocaleString('es-ES')} €</span>
            </div>
            <div className="flex justify-between">
              <span>Coste total estimado de la hipoteca:</span>
              <span className="font-semibold text-gray-900">{Math.round(totalPayment).toLocaleString('es-ES')} €</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">Cálculo orientativo sin valor contractual.</span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-[var(--dark)] text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
