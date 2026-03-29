import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Mail, Phone, MessageSquare, FileText, Send, User } from 'lucide-react';
import { apiFetch } from '../lib/api';

export function ContactDetails() {
  const { id } = useParams();
  const [contact, setContact] = useState<any>(null);
  const [newInteraction, setNewInteraction] = useState('');
  const [interactionType, setInteractionType] = useState('NOTE');

  useEffect(() => {
    apiFetch(`/api/contacts/${id}`)
      .then(res => res.json())
      .then(data => setContact(data));
  }, [id]);

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteraction.trim()) return;

    const res = await apiFetch(`/api/contacts/${id}/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: interactionType, content: newInteraction }),
    });

    if (res.ok) {
      const interaction = await res.json();
      setContact({
        ...contact,
        interactions: [interaction, ...contact.interactions]
      });
      setNewInteraction('');
    }
  };

  if (!contact) return <div>Carregando...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6 flex items-start justify-between">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="ml-5">
            <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
            <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
              {contact.email && (
                <span className="flex items-center">
                  <Mail className="mr-1.5 h-4 w-4 text-gray-400" />
                  {contact.email}
                </span>
              )}
              {contact.phone && (
                <span className="flex items-center">
                  <Phone className="mr-1.5 h-4 w-4 text-gray-400" />
                  {contact.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline (Única Fonte de Verdade) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Timeline do Cliente</h3>
            </div>
            
            {/* Add Interaction */}
            <div className="p-4 border-b border-gray-200">
              <form onSubmit={handleAddInteraction}>
                <div className="flex items-center space-x-4 mb-3">
                  <button
                    type="button"
                    onClick={() => setInteractionType('NOTE')}
                    className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-full ${interactionType === 'NOTE' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5" /> Nota
                  </button>
                  <button
                    type="button"
                    onClick={() => setInteractionType('WHATSAPP')}
                    className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-full ${interactionType === 'WHATSAPP' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setInteractionType('EMAIL')}
                    className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-full ${interactionType === 'EMAIL' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <Mail className="h-3.5 w-3.5 mr-1.5" /> E-mail
                  </button>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="min-w-0 flex-1">
                    <textarea
                      rows={3}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-none"
                      placeholder="Registre uma interação..."
                      value={newInteraction}
                      onChange={e => setNewInteraction(e.target.value)}
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Timeline List */}
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {contact.interactions.map((interaction: any, interactionIdx: number) => (
                    <li key={interaction.id}>
                      <div className="relative pb-8">
                        {interactionIdx !== contact.interactions.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                              ${interaction.type === 'WHATSAPP' ? 'bg-green-500' : 
                                interaction.type === 'EMAIL' ? 'bg-blue-500' : 
                                'bg-gray-400'}`}
                            >
                              {interaction.type === 'WHATSAPP' ? <MessageSquare className="h-4 w-4 text-white" /> :
                               interaction.type === 'EMAIL' ? <Mail className="h-4 w-4 text-white" /> :
                               <FileText className="h-4 w-4 text-white" />}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">
                                  {interaction.type === 'WHATSAPP' ? 'Mensagem de WhatsApp' : 
                                   interaction.type === 'EMAIL' ? 'E-mail enviado' : 
                                   'Nota adicionada'}
                                </span>
                              </p>
                              <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
                                {interaction.content}
                              </div>
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-gray-500">
                              <time dateTime={interaction.createdAt}>
                                {format(new Date(interaction.createdAt), "d 'de' MMM, HH:mm", { locale: ptBR })}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                  {contact.interactions.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhuma interação registrada.</p>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Oportunidades</h3>
            {contact.opportunities.length > 0 ? (
              <ul className="space-y-3">
                {contact.opportunities.map((opp: any) => (
                  <li key={opp.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opp.value)}
                      </span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {opp.stage}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma oportunidade vinculada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
