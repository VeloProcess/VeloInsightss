import React from 'react'
import './SkeletonLoader.css'

const SkeletonLoader = ({ variant = 'card', count = 1, className = '' }) => {
  const skeletons = Array.from({ length: count }).map((_, index) => (
    <div key={index} className={`skeleton-${variant} skeleton ${className}`}>
      {variant === 'card' && <CardSkeleton />}
      {variant === 'chart' && <ChartSkeleton />}
      {variant === 'table' && <TableSkeleton />}
      {variant === 'list' && <ListSkeleton />}
      {variant === 'metric' && <MetricSkeleton />}
    </div>
  ))

  return <>{skeletons}</>
}

const CardSkeleton = () => (
  <div className="card-skeleton-container">
    <div className="skeleton skeleton-line" style={{ width: '60%', height: '24px', marginBottom: '12px' }} />
    <div className="skeleton skeleton-line" style={{ width: '40%', height: '16px', marginBottom: '8px' }} />
    <div className="skeleton skeleton-line" style={{ width: '80%', height: '16px' }} />
  </div>
)

const ChartSkeleton = () => (
  <div className="chart-skeleton-container">
    <div className="skeleton skeleton-line" style={{ width: '70%', height: '20px', marginBottom: '24px' }} />
    <div className="skeleton skeleton-line" style={{ width: '100%', height: '200px', marginBottom: '16px', borderRadius: '12px' }} />
    <div className="skeleton-legend">
      <div className="skeleton skeleton-line" style={{ width: '80px', height: '12px', marginRight: '16px' }} />
      <div className="skeleton skeleton-line" style={{ width: '80px', height: '12px', marginRight: '16px' }} />
      <div className="skeleton skeleton-line" style={{ width: '80px', height: '12px', marginRight: '16px' }} />
    </div>
  </div>
)

const TableSkeleton = () => (
  <div className="table-skeleton-container">
    <div className="skeleton skeleton-line" style={{ width: '100%', height: '40px', marginBottom: '8px', borderRadius: '8px' }} />
    <div className="skeleton skeleton-line" style={{ width: '100%', height: '48px', marginBottom: '8px', borderRadius: '8px' }} />
    <div className="skeleton skeleton-line" style={{ width: '100%', height: '48px', marginBottom: '8px', borderRadius: '8px' }} />
    <div className="skeleton skeleton-line" style={{ width: '100%', height: '48px', marginBottom: '8px', borderRadius: '8px' }} />
    <div className="skeleton skeleton-line" style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
  </div>
)

const ListSkeleton = () => (
  <div className="list-skeleton-container">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="list-skeleton-item">
        <div className="skeleton skeleton-circle" style={{ width: '40px', height: '40px', marginRight: '12px' }} />
        <div className="skeleton-content">
          <div className="skeleton skeleton-line" style={{ width: '60%', height: '16px', marginBottom: '8px' }} />
          <div className="skeleton skeleton-line" style={{ width: '40%', height: '14px' }} />
        </div>
      </div>
    ))}
  </div>
)

const MetricSkeleton = () => (
  <div className="metric-skeleton-container">
    <div className="skeleton skeleton-line" style={{ width: '50%', height: '16px', marginBottom: '12px' }} />
    <div className="skeleton skeleton-line" style={{ width: '70%', height: '32px', marginBottom: '8px' }} />
    <div className="skeleton skeleton-line" style={{ width: '40%', height: '14px' }} />
  </div>
)

export default SkeletonLoader

