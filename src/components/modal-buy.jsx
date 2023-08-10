import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useDispatch, useSelector } from "react-redux";
import api from "../json-server/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { type } from "@testing-library/user-event/dist/type";
import { types } from "../redux/types";

export const ModalBuy = (props) => {
  const userSelector = useSelector((state) => state.auth);
  const [events_map, setEvents_map] = useState(new Map());
  const dispatch = useDispatch();
  // console.log(userSelector);

  const { eventid, eventname } = useParams();

  const fetchEventsMap = async () => {
    try {
      const res_events = await api.get("/events");
      const temp_events_map = new Map();
      res_events.data.map((an_event) =>
        temp_events_map.set(an_event.id, an_event)
      );
      setEvents_map(temp_events_map);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEventsMap();
  }, []);
  useEffect(() => {
    fetchEventsMap();
  }, [props]);

  const event_id = Number(eventid);
  const thisevent = events_map.get(event_id);

  // console.log(thisevent["vip-ticket-stock"]);

  const buy = async () => {
    // saldo(points) berkurang
    const sisaSaldo = userSelector.points - thisevent["vip-ticket-price"];
    if (sisaSaldo <= 0) return alert("saldo anda tidak cukup");

    try {
      await api.patch(`/users/${userSelector.id}`, {
        points: sisaSaldo,
      });

      // console.log("sisa saldo", sisaSaldo);

      await dispatch({
        type: types.update_saldo,
        payload: { ["points"]: sisaSaldo },
      });
      // console.log(userSelector.points);
    } catch (err) {
      console.log(err);
    }

    // stock berkurang
    const stock = thisevent["vip-ticket-stock"];
    console.log(stock);

    //apabila stok nya udah 0 maka gabisa dibeli
    if (stock <= 0) return alert("stok habis");
    await api.patch(`/events/${event_id}`, {
      ["vip-ticket-stock"]: stock - 1,
    });
    props.fetchThisEvent();

    return props.onHide();
  };

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Are you sure want to buy this ticket?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          Price of this ticket: Rp
          {thisevent &&
            thisevent &&
            Number(thisevent["vip-ticket-price"]).toLocaleString(`id-ID`)}
          ,00
        </div>
        <div>
          Your Balance: Rp.{Number(userSelector.points).toLocaleString(`id-ID`)}
          ,00
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide} variant="secondary">
          Close
        </Button>
        <Button variant="primary" onClick={buy}>
          Buy VIP Ticket
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
