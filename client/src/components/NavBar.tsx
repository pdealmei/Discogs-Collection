import { Link } from 'react-router-dom';
import '../css/NavBar.css';

const NavBar: React.FC = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Records List</Link>
            </div>
            <div className="navbar-links">
                <Link to="/" className="navbar-link">Home</Link>
                <Link to="/wishlist" className="navbar-link">Wishlist</Link>
            </div>
        </nav>
    );
};

export default NavBar;