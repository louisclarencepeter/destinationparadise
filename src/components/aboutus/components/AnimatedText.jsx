import PropTypes from 'prop-types';
import { useIntersectionObserver } from '../../../hooks/useIntersectionObserver';


export const AnimatedText = ({ children, delay = 0, className = '' }) => {
    const [ref, entries] = useIntersectionObserver({
      threshold: 0.1,
      rootMargin: '50px',
    });
  
    const isVisible = entries.some((entry) => entry.isIntersecting);
  
    return (
      <div 
        ref={ref}
        className={`animated-text ${className} ${isVisible ? 'visible' : ''}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    );
  };
  
  AnimatedText.propTypes = {
    children: PropTypes.node.isRequired,
    delay: PropTypes.number,
    className: PropTypes.string,
  };