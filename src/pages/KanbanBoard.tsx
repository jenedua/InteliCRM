import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiFetch } from '../lib/api';

const STAGES = [
  { id: 'LEAD', title: 'Leads', color: 'bg-gray-100', borderColor: 'border-gray-200' },
  { id: 'QUALIFIED', title: 'Qualificados', color: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'PROPOSAL', title: 'Proposta', color: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { id: 'WON', title: 'Ganhos', color: 'bg-green-50', borderColor: 'border-green-200' },
  { id: 'LOST', title: 'Perdidos', color: 'bg-red-50', borderColor: 'border-red-200' },
];

export function KanbanBoard() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [newOppTitle, setNewOppTitle] = useState('');
  const [newOppValue, setNewOppValue] = useState('');

  useEffect(() => {
    apiFetch('/api/opportunities')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOpportunities(data);
        } else {
          console.error('Failed to fetch opportunities:', data);
          setOpportunities([]);
        }
      })
      .catch(err => {
        console.error('Error fetching opportunities:', err);
        setOpportunities([]);
      });
  }, []);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Optimistic update
    const newOpps = Array.from(opportunities);
    const draggedOppIndex = newOpps.findIndex(o => o.id === draggableId);
    const draggedOpp = newOpps[draggedOppIndex];
    
    draggedOpp.stage = destination.droppableId;
    
    // Simple reordering logic for UI
    newOpps.splice(draggedOppIndex, 1);
    
    // Find insertion index
    const destOpps = newOpps.filter(o => o.stage === destination.droppableId);
    destOpps.splice(destination.index, 0, draggedOpp);
    
    // Rebuild array
    const finalOpps = newOpps.filter(o => o.stage !== destination.droppableId).concat(destOpps);
    setOpportunities(finalOpps);

    // Persist
    await apiFetch(`/api/opportunities/${draggableId}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: destination.droppableId, order: destination.index }),
    });
  };

  const handleAddOpportunity = async (stageId: string) => {
    if (!newOppTitle) return;

    const res = await apiFetch('/api/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newOppTitle,
        value: parseFloat(newOppValue) || 0,
        stage: stageId,
      }),
    });

    if (res.ok) {
      const newOpp = await res.json();
      setOpportunities([...opportunities, newOpp]);
      setIsAdding(null);
      setNewOppTitle('');
      setNewOppValue('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pipeline de Vendas</h2>
        <p className="mt-1 text-sm text-gray-500">Arraste os cards para atualizar o status das oportunidades.</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex h-full items-start space-x-4 min-w-max">
            {STAGES.map(stage => {
              const stageOpps = opportunities.filter(o => o.stage === stage.id);
              const totalValue = stageOpps.reduce((sum, o) => sum + o.value, 0);

              return (
                <div key={stage.id} className={cn("flex flex-col w-80 max-h-full rounded-xl border", stage.color, stage.borderColor)}>
                  <div className="p-3 flex items-center justify-between border-b border-black/5">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700">{stage.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {stageOpps.length} • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px]",
                          snapshot.isDraggingOver && "bg-black/5"
                        )}
                      >
                        {stageOpps.map((opp, index) => (
                          <Draggable key={opp.id} draggableId={opp.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "bg-white p-4 rounded-lg shadow-sm border border-gray-200 group hover:border-indigo-300 transition-colors",
                                  snapshot.isDragging && "shadow-lg ring-2 ring-indigo-500 ring-opacity-50"
                                )}
                              >
                                <h4 className="text-sm font-medium text-gray-900">{opp.title}</h4>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opp.value)}
                                  </span>
                                  {opp.contact && (
                                    <span className="text-xs text-gray-500 truncate max-w-[100px]">
                                      {opp.contact.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {isAdding === stage.id ? (
                          <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-300">
                            <input
                              type="text"
                              placeholder="Título da oportunidade"
                              className="w-full text-sm border-gray-300 rounded-md mb-2 focus:ring-indigo-500 focus:border-indigo-500"
                              value={newOppTitle}
                              onChange={e => setNewOppTitle(e.target.value)}
                              autoFocus
                            />
                            <input
                              type="number"
                              placeholder="Valor (R$)"
                              className="w-full text-sm border-gray-300 rounded-md mb-3 focus:ring-indigo-500 focus:border-indigo-500"
                              value={newOppValue}
                              onChange={e => setNewOppValue(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => setIsAdding(null)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                              >
                                Cancelar
                              </button>
                              <button 
                                onClick={() => handleAddOpportunity(stage.id)}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                              >
                                Salvar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsAdding(stage.id)}
                            className="w-full flex items-center justify-center py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-black/5 rounded-lg transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Adicionar
                          </button>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
