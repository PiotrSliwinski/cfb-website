import Link from 'next/link';
import { useLocale } from 'next-intl';

export function Logo() {
  const locale = useLocale();

  return (
    <Link href={`/${locale}`} className="inline-flex items-center gap-2">
      {/* Company Icon SVG - Exact from original */}
      <div className="flex-shrink-0">
        <svg viewBox="0 0 344 344" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" className="h-8 w-auto">
          <g transform="matrix(1,0,0,1,-1130.32,-1092.3)">
            <g transform="matrix(0,-4.16667,-4.16667,0,1208.67,1092.3)">
              <path d="M-18.803,-18.803C-29.188,-18.803 -37.606,-10.385 -37.606,0C-37.606,10.385 -29.188,18.803 -18.803,18.803C-8.418,18.803 0,10.385 0,0C0,-10.385 -8.418,-18.803 -18.803,-18.803" style={{ fill: 'rgb(0,152,170)', fillRule: 'nonzero' }}/>
            </g>
            <g transform="matrix(0,-4.16667,-4.16667,0,1395.82,1279.45)">
              <path d="M-18.803,-18.803C-29.188,-18.803 -37.606,-10.385 -37.606,0C-37.606,10.384 -29.188,18.803 -18.803,18.803C-8.418,18.803 0,10.384 0,0C0,-10.385 -8.418,-18.803 -18.803,-18.803" style={{ fill: 'rgb(0,152,170)', fillRule: 'nonzero' }}/>
            </g>
            <g transform="matrix(4.16667,0,0,4.16667,1284.81,1189.13)">
              <path d="M0,36.043C-3.027,23.276 9.439,10.81 22.205,13.838C28.364,15.326 35.129,13.668 39.937,8.859C47.28,1.516 47.28,-10.389 39.937,-17.732C32.594,-25.075 20.689,-25.075 13.346,-17.732C8.537,-12.923 6.878,-6.158 8.368,0.001C11.394,12.767 -1.071,25.231 -13.837,22.205C-19.996,20.716 -26.761,22.375 -31.57,27.183C-38.913,34.526 -38.913,46.432 -31.57,53.775C-24.227,61.118 -12.321,61.118 -4.978,53.775C-0.17,48.966 1.489,42.202 0,36.043" style={{ fill: 'rgb(0,152,170)', fillRule: 'nonzero' }}/>
            </g>
          </g>
        </svg>
      </div>

      {/* Text Logo - Commissioner Font matching original spacing */}
      <div className="flex flex-col">
        <div
          className="text-primary-600 uppercase leading-none"
          style={{
            fontFamily: 'Commissioner, sans-serif',
            fontSize: '18px',
            fontWeight: 200,
            letterSpacing: 'normal'
          }}
        >
          CLÍNICA
        </div>
        <div
          className="text-primary-600 uppercase leading-none"
          style={{
            fontFamily: 'Commissioner, sans-serif',
            fontSize: '18px',
            fontWeight: 400,
            letterSpacing: 'normal'
          }}
        >
          FERREIRA BORGES
        </div>
      </div>
    </Link>
  );
}
