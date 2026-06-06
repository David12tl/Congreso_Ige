import CardNav from './Card_nav'


export default function Navbar() {
  const items = [
    {
      label: "CONÓCENOS",
      bgColor: "#1B1722",
      textColor: "#fff",
      links: [
        { label: "QUIENES SOMOS", ariaLabel: "About Company", href: "/aboutme" },
        { label: "IGE", ariaLabel: "About Careers", href: "/about-ige" }
      ]
    },
    {
      label: "Contact",
      bgColor: "#2F293A", 
      textColor: "#fff",
      links: [
        { label: "Email", ariaLabel: "Email us", href: "#" },
        { label: "Twitter", ariaLabel: "Twitter", href: "#" },
        { label: "LinkedIn", ariaLabel: "LinkedIn", href: "#" }
      ]
    },
    {
      label: "Registro",
      bgColor: "#2F293A", 
      textColor: "#fff",
      links: [
        { label: "Registrate", ariaLabel: "aqui", href: "/register" } // Ruta absoluta para evitar 404
      ]
    }
  ];

  return (
    <CardNav
      items={items}
      baseColor="#fff"
      menuColor="#000"
      buttonBgColor="#111"
      buttonTextColor="#fff"
      ease="power3.out"
/>
  );
}