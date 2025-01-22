// src/components/ui/Alert.jsx
const Alert = ({ children, className = '', ...props }) => (
    <div 
      className={`alert ${className}`}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
  
  export default Alert;