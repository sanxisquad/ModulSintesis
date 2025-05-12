export const Header = () => {
    return (
        <header className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-20 flex flex-col items-center justify-center">
            <div className="text-center px-4 max-w-4xl">
                <h1 className="text-5xl font-extrabold mb-6 text-green-500">ReciclamJa</h1>
                <p className="text-xl mb-8 text-gray-300">
                    La app para gestionar el reciclaje de manera eficiente y contribuir a un mundo más sostenible.
                </p>
                <a
                    href="/zonas"
                    className="bg-green-500 text-black px-8 py-4 rounded-md text-lg font-semibold hover:bg-green-600 transition"
                >
                    Explorar Zonas de Reciclaje
                </a>
            </div>
        </header>
    );
};