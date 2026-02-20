import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useStockDetails } from '../hooks/useStockData';
import { formatPrice, formatPercentage, formatLargeNumber } from '../utils/formatters';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { Button } from '../components/common/Button';
import clsx from 'clsx';

export default function StockDetails() {
    const { symbol } = useParams<{ symbol: string }>();
    const { data, loading, error, refetch } = useStockDetails(symbol || null);
    const { isInWatchlist, addStock, removeStock } = useWatchlist();

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

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage error={error} onRetry={refetch} />;
    }

    if (!data) {
        return <ErrorMessage error="Stock not found" />;
    }

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
                        {data.sector && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                {data.sector} • {data.industry}
                            </p>
                        )}
                    </div>

                    <div className="text-right">
                        <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                            {formatPrice(data.price)}
                        </div>
                        <div className={clsx(
                            'flex items-center justify-end gap-2 text-lg font-semibold mt-2',
                            isPositive ? 'text-success-600' : 'text-danger-600'
                        )}>
                            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                            <span>{formatPrice(data.change)} ({formatPercentage(data.changePercent)})</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Open</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
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
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                        {formatLargeNumber(data.volume)}
                    </div>
                </Card>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">
                        Market Data
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Market Cap</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {formatLargeNumber(data.marketCap)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">P/E Ratio</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {data.peRatio?.toFixed(2) || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">52W High</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {formatPrice(data.fiftyTwoWeekHigh)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">52W Low</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {formatPrice(data.fiftyTwoWeekLow)}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">
                        Company Info
                    </h3>
                    {data.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {data.description}
                        </p>
                    )}
                    <div className="space-y-2 text-sm">
                        {data.ceo && (
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">CEO</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{data.ceo}</span>
                            </div>
                        )}
                        {data.employees && (
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Employees</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {data.employees.toLocaleString()}
                                </span>
                            </div>
                        )}
                        {data.headquarters && (
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Headquarters</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{data.headquarters}</span>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Placeholder for Charts */}
            <Card>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">
                    Price Chart
                </h3>
                <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                    <p className="text-gray-500 dark:text-gray-400">Chart coming soon...</p>
                </div>
            </Card>
        </div>
    );
}
