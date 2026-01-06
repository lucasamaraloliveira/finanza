
import React, { useRef, useState } from 'react';
import { scanReceipt } from '../services/geminiService';
import { ICONS } from '../constants';
import { Transaction, TransactionType, Category } from '../types';

interface ScannerIAProps {
  onAdd: (t: Transaction) => void;
}

const ScannerIA: React.FC<ScannerIAProps> = ({ onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setPreview(reader.result as string);
      setLoading(true);
      
      const result = await scanReceipt(base64);
      if (result) {
        const newT: Transaction = {
          id: crypto.randomUUID(),
          description: result.description,
          amount: result.amount,
          date: result.date || new Date().toISOString().split('T')[0],
          type: TransactionType.EXPENSE,
          // Fixed: Category is a type, not a value. Replacing Category.OTHERS with 'Outros'.
          category: (result.category as Category) || 'Outros',
          userId: 'default'
        };
        onAdd(newT);
        alert('Lançamento extraído com sucesso pela IA!');
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
      <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto text-indigo-600">
        <ICONS.Scanner />
      </div>
      <h3 className="text-xl font-bold">Scanner de Recibos Inteligente</h3>
      <p className="text-slate-500 max-w-xs mx-auto text-sm">Tire uma foto do cupom fiscal e o Gemini irá preencher os dados para você automaticamente.</p>
      
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      
      <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50">
        {loading ? 'Analisando Imagem...' : 'Escanear agora'}
      </button>

      {preview && <img src={preview} className="mt-4 mx-auto h-48 rounded-xl object-contain border border-slate-200" alt="Preview" />}
    </div>
  );
};

export default ScannerIA;
