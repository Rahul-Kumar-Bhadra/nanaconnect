import React from 'react';

interface NanaCardProps {
  title: string;
  subtitle: string;
  score: string;
  progress: number;
}

const NanaCard: React.FC<NanaCardProps> = ({ title, subtitle, score, progress }) => {
  return (
    <div className="nana-card">
      <div className="nana-card__wrapper">
        <div className="nana-card___wrapper-acounts">
          <div className="nana-card__score">{score}</div>
          <div className="nana-card__acounts">
            <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="64" cy="64" r="64" fill="#F6DB96" />
              <path d="M64 32C46.3269 32 32 46.3269 32 64C32 81.6731 46.3269 96 64 96C81.6731 96 96 81.6731 96 64C96 46.3269 81.6731 32 64 32ZM64 48C72.8366 48 80 55.1634 80 64C80 72.8366 72.8366 80 64 80C55.1634 80 48 72.8366 48 64C48 55.1634 55.1634 48 64 48Z" fill="#000" />
            </svg>
          </div>
          <div className="nana-card__acounts">
            <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="64" cy="64" r="64" fill="#F6DB96" />
              <path d="M64 32C46.3269 32 32 46.3269 32 64C32 81.6731 46.3269 96 64 96C81.6731 96 96 81.6731 96 64C96 46.3269 81.6731 32 64 32ZM64 48C72.8366 48 80 55.1634 80 64C80 72.8366 72.8366 80 64 80C55.1634 80 48 72.8366 48 64C48 55.1634 55.1634 48 64 48Z" fill="#000" />
            </svg>
          </div>
        </div>
        <div className="nana-card__menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
          </svg>
        </div>
      </div>
      <div className="nana-card__title">{title}</div>
      <div className="nana-card__subtitle">{subtitle}</div>
      <div className="nana-card__indicator">Progress</div>
      <div className="nana-card__progress">
        <progress max="100" value={progress}></progress>
      </div>
    </div>
  );
};

export default NanaCard;
