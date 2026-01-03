import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { tecnicoService } from '../services/tecnicoService';
import type { OrdemServicoItem } from '../types';

export default function OrdensScreen() {
  const [ordens, setOrdens] = useState<OrdemServicoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadOrdens();
  }, []);

  const loadOrdens = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await tecnicoService.getMyOrdens(pageNum, 10);
      
      if (pageNum === 1 || refresh) {
        setOrdens(response.data);
      } else {
        setOrdens(prev => [...prev, ...response.data]);
      }
      
      setPage(pageNum);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao carregar ordens de serviço');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    loadOrdens(1, true);
  }, []);

  const loadMore = () => {
    if (!loadingMore && page < totalPages) {
      loadOrdens(page + 1);
    }
  };

  const handleView = (item: OrdemServicoItem) => {
    // Debug: verificar o que está vindo da API
    console.log('📋 Dados da OS:', JSON.stringify(item.ordemServico, null, 2));
    
    const dataEvento = formatDate(item.ordemServico.data);
    const dataAgendamento = formatDate(item.atendimento.dataAgendamento);
    const dataMontagem = item.ordemServico.dataMontagem ? formatDate(item.ordemServico.dataMontagem) : 'Não informada';
    const horarioMontagem = item.ordemServico.horarioMontagem || 'Não informado';
    
    const detalhes = `OS: ${item.ordemServico.numeroOS}\n\n` +
      `Cliente: ${item.ordemServico.nomeCliente}\n\n` +
      `Evento: ${item.ordemServico.nomeEvento}\n\n` +
      `Data do Evento: ${dataEvento}\n\n` +
      `Data da Montagem: ${dataMontagem}\n` +
      `Horário da Montagem: ${horarioMontagem}\n\n` +
      `Agendamento: ${dataAgendamento}\n\n` +
      `Status: ${getStatusLabel(item.atendimento.status)}` +
      (item.funcao ? `\n\nSua Função: ${item.funcao}` : '') +
      (item.atendimento.observacoes ? `\n\nObservações: ${item.atendimento.observacoes}` : '');
    
    Alert.alert('Detalhes da OS', detalhes, [{ text: 'Fechar' }]);
  };

  const handleAccept = async (item: OrdemServicoItem) => {
    Alert.alert(
      'Aceitar OS',
      `Deseja aceitar a OS ${item.ordemServico.numeroOS}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: async () => {
            try {
              await tecnicoService.acceptOrdem(item.atendimentoId);
              Alert.alert('Sucesso', 'OS aceita com sucesso!');
              loadOrdens(1, true);
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao aceitar OS');
            }
          },
        },
      ]
    );
  };

  const handleFinish = async (item: OrdemServicoItem) => {
    Alert.alert(
      'Finalizar OS',
      `Deseja finalizar a OS ${item.ordemServico.numeroOS}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: async () => {
            try {
              await tecnicoService.finishOrdem(item.atendimentoId);
              Alert.alert('Sucesso', 'OS finalizada com sucesso!');
              loadOrdens(1, true);
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao finalizar OS');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return '#2196F3';
      case 'em_andamento':
        return '#FF9800';
      case 'concluido':
        return '#4CAF50';
      case 'cancelado':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'nao_agendado':
        return 'Não Agendado';
      case 'agendado':
        return 'Agendado';
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: OrdemServicoItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.osNumber}>OS: {item.ordemServico.numeroOS}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.atendimento.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.atendimento.status)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.label}>Cliente:</Text>
        <Text style={styles.value}>{item.ordemServico.nomeCliente}</Text>

        <Text style={styles.label}>Evento:</Text>
        <Text style={styles.value}>{item.ordemServico.nomeEvento}</Text>

        <Text style={styles.label}>Data do Evento:</Text>
        <Text style={styles.value}>{formatDate(item.ordemServico.data)}</Text>

        {item.funcao && (
          <>
            <Text style={styles.label}>Sua Função:</Text>
            <Text style={styles.value}>{item.funcao}</Text>
          </>
        )}

        <Text style={styles.label}>Agendamento:</Text>
        <Text style={styles.value}>{formatDate(item.atendimento.dataAgendamento)}</Text>

        {item.atendimento.observacoes && (
          <>
            <Text style={styles.label}>Observações:</Text>
            <Text style={styles.value}>{item.atendimento.observacoes}</Text>
          </>
        )}
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={[styles.button, styles.viewButton]}
          onPress={() => handleView(item)}
        >
          <Text style={styles.buttonText}>📄 Ver</Text>
        </TouchableOpacity>
        {item.atendimento.status === 'agendado' && (
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={() => handleAccept(item)}
          >
            <Text style={styles.buttonText}>✓ Aceitar</Text>
          </TouchableOpacity>
        )}
        {item.atendimento.status === 'em_andamento' && (
          <TouchableOpacity
            style={[styles.button, styles.finishButton]}
            onPress={() => handleFinish(item)}
          >
            <Text style={styles.buttonText}>✓ Finalizar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ordens}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📋</Text>
            <Text style={styles.emptyTitle}>Nenhuma OS em aberto</Text>
            <Text style={styles.emptySubtitle}>
              Você não possui ordens de serviço pendentes no momento
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#4CAF50" />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  osNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#757575',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  finishButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
