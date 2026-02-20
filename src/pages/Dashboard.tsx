import React from 'react';
import { useMarketOverview, useTrendingStocks } from '../hooks/useMarketData';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice, formatPercentage } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function Dashboard() {
    const { data: marketData, loading: marketLoading, error: marketError, refetch: refetchMarket } = useMarketOverview(true);
    const { data: trendingData, loading: trendingLoading, error: trendingError, refetch: refetchTrending } = useTrendingStocks();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Market Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Real-time market overview and trending stocks
                </p>
            </div>

            {/* Market Overview */}
            <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Market Indices
                </h2>

                {marketLoading ? (
                    <LoadingSpinner />
                ) : marketError ? (
                    <ErrorMessage error={marketError} onRetry={refetchMarket} />
                ) : marketData ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {marketData.indices.map((index) => (
                            <Card key={index.symbol} className="hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {index.name}
                                        </h3>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                            {formatPrice(index.value)}
                                        </p>
                                    </div>
                                    <div className={clsx(
                                        'flex items-center gap-1 text-sm font-semibold',
                                        index.changePercent >= 0 ? 'text-success-600' : 'text-danger-600'
                                    )}>
                                        {index.changePercent >= 0 ? (
                                            <TrendingUp className="w-5 h-5" />
                                        ) : (
                                            <TrendingDown className="w-5 h-5" />
                                        )}
                                        <span>{formatPercentage(index.changePercent)}</span>
                                    </div>
                                </div>
                                <div className={clsx(
                                    'text-sm mt-2',
                                    index.change >= 0 ? 'text-success-600' : 'text-danger-600'
                                )}>
                                    {index.change >= 0 ? '+' : ''}{formatPrice(index.change)}
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : null}

                {marketData && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className={clsx(
                            'w-2 h-2 rounded-full',
                            marketData.marketStatus === 'open' ? 'bg-success-500 animate-pulse' : 'bg-gray-400'
                        )} />
                        <span>Market Status: <span className="font-medium capitalize">{marketData.marketStatus}</span></span>
                    </div>
                )}
            </section>

            {/* Trending Stocks */}
            <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Trending Stocks
                </h2>

                {trendingLoading ? (
                    <LoadingSpinner />
                ) : trendingError ? (
                    <ErrorMessage error={trendingError} onRetry={refetchTrending} />
                ) : trendingData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trendingData.map((stock) => (
                            <Card
                                key={stock.symbol}
                                className="cursor-pointer hover:shadow-xl transition-all hover:scale-105"
                                onClick={() => navigate(`/app/stock/${stock.symbol}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                            {stock.symbol}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {stock.name}
                                        </p>
                                    </div>
                                    <div className={clsx(
                                        'text-sm font-semibold px-2 py-1 rounded',
                                        stock.changePercent >= 0
                                            ? 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300'
                                            : 'bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300'
                                    )}>
                                        {formatPercentage(stock.changePercent)}
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatPrice(stock.price)}
                                    </p>
                                </div>

                                {/* Mini sparkline */}
                                {stock.sparkline && stock.sparkline.length > 0 && (
                                    <div className="mt-3 h-12 flex items-end gap-1">
                                        {stock.sparkline.map((value, index) => {
                                            const max = Math.max(...stock.sparkline!);
                                            const min = Math.min(...stock.sparkline!);
                                            const height = ((value - min) / (max - min)) * 100;

                                            return (
                                                <div
                                                    key={index}
                                                    className={clsx(
                                                        'flex-1 rounded-t',
                                                        stock.changePercent >= 0 ? 'bg-success-400' : 'bg-danger-400'
                                                    )}
                                                    style={{ height: `${height}%` }}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : null}
            </section>

            {/* Quick Actions */}
            <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card
                        className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800"
                        onClick={() => navigate('/app/watchlist')}
                    >
                        <h3 className="font-semibold text-lg text-primary-900 dark:text-primary-100">
                            View Watchlist
                        </h3>
                        <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                            Track your favorite stocks in one place
                        </p>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800"
                        onClick={() => navigate('/app/comparison')}
                    >
                        <h3 className="font-semibold text-lg text-purple-900 dark:text-purple-100">
                            Compare Stocks
                        </h3>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                            Analyze multiple stocks side-by-side
                        </p>
                    </Card>
                </div>
            </section>
        </div>
    );
}
