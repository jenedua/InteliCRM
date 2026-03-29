import React, { useState, useEffect } from 'react';
import { Search, X, User, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ contacts: any[], opportunities: any[] }>({ contacts: [], opportunities: [] });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ contacts: [], opportunities: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 2) {
      // In a real app, this would be a single API call to a search endpoint
      Promise.all([
        apiFetch('/api/contacts').then(res => res.json()).catch(() => []),
        apiFetch('/api/opportunities').then(res => res.json()).catch(() => [])
      ]).then(([contacts, opps]) => {
        const validContacts = Array.isArray(contacts) ? contacts : [];
        const validOpps = Array.isArray(opps) ? opps : [];
        
        const lowerQuery = query.toLowerCase();
        setResults({
          contacts: validContacts.filter((c: any) => c.name.toLowerCase().includes(lowerQuery) || c.email?.toLowerCase().includes(lowerQuery)),
          opportunities: validOpps.filter((o: any) => o.title.toLowerCase().includes(lowerQuery))
        });
      });
    } else {
      setResults({ contacts: [], opportunities: [] });
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden ring-1 ring-black ring-opacity-5 mx-4">
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            className="flex-1 ml-3 bg-transparent border-0 focus:ring-0 text-gray-900 placeholder-gray-400 text-lg"
            placeholder="Buscar contatos, oportunidades..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {query.length > 2 && (
          <div className="max-h-96 overflow-y-auto p-2">
            {results.contacts.length > 0 && (
              <div className="mb-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contatos</h3>
                {results.contacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => { navigate(`/contacts/${contact.id}`); onClose(); }}
                    className="w-full flex items-center px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <User className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.opportunities.length > 0 && (
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Oportunidades</h3>
                {results.opportunities.map(opp => (
                  <button
                    key={opp.id}
                    onClick={() => { navigate(`/pipeline`); onClose(); }}
                    className="w-full flex items-center px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <Briefcase className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opp.value)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.contacts.length === 0 && results.opportunities.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                Nenhum resultado encontrado para "{query}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
