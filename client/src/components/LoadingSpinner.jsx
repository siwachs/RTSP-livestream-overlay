import PropTypes from "prop-types";

const LoadingSpinner = ({ size = "medium" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-blue-500 border-t-transparent`}
    />
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
};

export default LoadingSpinner;
