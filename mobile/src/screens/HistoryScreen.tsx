import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { tecnicoService } from '../services/tecnicoService';
import type { OrdemServicoItem } from '../types';

export default function HistoryScreen() {
  const [ordens, setOrdens] = useState<OrdemServicoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await tecnicoService.getHistory(pageNum, 10);
      
      if (pageNum === 1 || refresh) {
        setOrdens(response.data);
      } else {
        setOrdens(prev => [...prev, ...response.data]);
      }
      
      setPage(pageNum);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao carregar histórico');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    loadHistory(1, true);
  }, []);

  const loadMore = () => {
    if (!loadingMore && page < totalPages) {
      loadHistory(page + 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

        {item.atendimento.finalizadoEm && (
          <>
            <Text style={styles.label}>Finalizado em:</Text>
            <Text style={styles.value}>{formatDate(item.atendimento.finalizadoEm)}</Text>
          </>
        )}

        {item.atendimento.observacoes && (
          <>
            <Text style={styles.label}>Observações:</Text>
            <Text style={styles.value}>{item.atendimento.observacoes}</Text>
          </>
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
            <Text style={styles.emptyText}>📚</Text>
            <Text style={styles.emptyTitle}>Nenhum histórico</Text>
            <Text style={styles.emptySubtitle}>
              Você ainda não possui ordens de serviço finalizadas
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
    marginBottom: 8,
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
