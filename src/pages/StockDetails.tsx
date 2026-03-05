import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useStockDetails } from '../hooks/useStockData';
import { formatPrice, formatPercentage, formatLargeNumber } from '../utils/formatters';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { Button } from '../components/common/Button';
import CandlestickChart from "../components/charts/CandlestickChart";
import clsx from 'clsx';
import { mockApi } from '../services/mockApi';
import type { HistoricalDataPoint } from '../types/stock';

export default function StockDetails() {
    const { symbol } = useParams<{ symbol: string }>();
    const { data, loading, error, refetch } = useStockDetails(symbol || null);
    const { isInWatchlist, addStock, removeStock } = useWatchlist();

    const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
    const [chartLoading, setChartLoading] = useState(false);

    useEffect(() => {
        if (!symbol) return;

        const fetchHistorical = async () => {
            try {
                setChartLoading(true);
                const result = await mockApi.getHistoricalData(symbol, "1M");
                setHistoricalData(result);
            } catch (err) {
                console.error("CandleChartError:", err);
            } finally {
                setChartLoading(false);
            }
        };

        fetchHistorical();
    }, [symbol]);

    const handleWatchlistToggle = async () => {
        if (!symbol) return;

        try {
            if (isInWatchlist(symbol)) {
                await removeStock(symbol);
            } else {
                await addStock(symbol);
            }
        } catch (error) {
            console.error('Watchlist error:', error);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} onRetry={refetch} />;
    if (!data) return <ErrorMessage error="Stock not found" />;

    const isPositive = data.changePercent >= 0;

    return (
        <div className="space-y-6">

            {/* Stock Header */}
            <Card>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {data.symbol}
                            </h1>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleWatchlistToggle}
                            >
                                <Star
                                    className={clsx(
                                        'w-4 h-4',
                                        isInWatchlist(data.symbol) && 'fill-current text-yellow-500'
                                    )}
                                />
                                {isInWatchlist(data.symbol) ? 'Remove' : 'Add to Watchlist'}
                            </Button>
                        </div>

                        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                            {data.name}
                        </p>
                    </div>

                    <div className="text-right">
                        <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                            {formatPrice(data.price)}
                        </div>

                        <div
                            className={clsx(
                                'flex items-center justify-end gap-2 text-lg font-semibold mt-2',
                                isPositive ? 'text-success-600' : 'text-danger-600'
                            )}
                        >
                            {isPositive
                                ? <TrendingUp className="w-5 h-5" />
                                : <TrendingDown className="w-5 h-5" />
                            }

                            <span>
                                {formatPrice(data.change)} ({formatPercentage(data.changePercent)})
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Open</div>
                    <div className="text-xl font-bold mt-1">
                        {formatPrice(data.open)}
                    </div>
                </Card>

                <Card>
                    <div className="text-sm text-gray-600 dark:text-gray-400">High</div>
                    <div className="text-xl font-bold text-success-600 mt-1">
                        {formatPrice(data.high)}
                    </div>
                </Card>

                <Card>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Low</div>
                    <div className="text-xl font-bold text-danger-600 mt-1">
                        {formatPrice(data.low)}
                    </div>
                </Card>

                <Card>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Volume</div>
                    <div className="text-xl font-bold mt-1">
                        {formatLargeNumber(data.volume)}
                    </div>
                </Card>
            </div>

            {/* 📊 Price Chart */}
            <Card>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">
                    Price Chart (1 Month)
                </h3>

                {chartLoading ? (
                    <div className="h-80 flex items-center justify-center">
                        <LoadingSpinner />
                    </div>
                ) : historicalData.length > 0 ? (
                    <CandlestickChart data={historicalData} />
                ) : (
                    <div className="h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                        <p className="text-gray-500 dark:text-gray-400">
                            No historical data available
                        </p>
                    </div>
                )}
            </Card>

        </div>
    );
}