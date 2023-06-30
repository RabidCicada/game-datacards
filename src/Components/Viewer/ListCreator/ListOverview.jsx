import {
  CrownFilled,
  DeleteOutlined,
  FileTextOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
} from "@ant-design/icons";
import { Button, Col, Row, Space, message } from "antd";
import { useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { useNavigate } from "react-router-dom";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useMobileList } from "../useMobileList";

export const ListOverview = ({ setShowList }) => {
  const { lists, selectedList, removeDatacard } = useMobileList();
  const [fullscreen, setFullscreen] = useState(false);
  const { dataSource } = useDataSourceStorage();
  const navigate = useNavigate();

  return (
    <OutsideClickHandler
      onOutsideClick={() => {
        setShowList(false);
      }}>
      <div
        onClick={() => setShowList(false)}
        style={{
          display: "block",
          position: "absolute",
          height: "100vh",
          width: "100vw",
          top: "0px",
          bottom: "0px",
          zIndex: 888,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "48px",
          left: "0px",
          width: "100vw",
          minHeight: fullscreen ? "calc(100vh - 112px)" : "300px",
          backgroundColor: "#FFFFFF",
          height: "28%",
          zIndex: "999",
          paddingTop: "0px",
          borderTop: "2px solid #001529",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarGutter: "stable",
        }}>
        <Space
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "end",
            paddingRight: "16px",
            borderBottom: "1px solid grey",
          }}>
          <Button
            type="text"
            shape="circle"
            size="large"
            icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            className="mobile-icon-button"
            onClick={() => {
              setFullscreen((val) => !val);
            }}></Button>
          <Button
            type="text"
            shape="circle"
            size="large"
            icon={<FileTextOutlined />}
            className="mobile-icon-button"
            onClick={() => {
              let listText = "Warhammer 40K List";
              lists[selectedList].datacards
                ?.toSorted((a, b) => {
                  if (a.warlord) {
                    return -1;
                  }
                  if (b.warlord) {
                    return 1;
                  }
                  return a.card.name.localeCompare(b.card.name);
                })
                .forEach((val) => {
                  listText += `\n\n${val.card.name} ${val.points.models > 1 ? val.points.models + "x" : ""} (${
                    val.points.cost
                  } pts)`;
                  if (val.warlord) {
                    listText += `\n${val.warlord ? "  Warlord" : ""}`;
                  }
                  if (val.enhancement) {
                    listText += `\n  ${val.enhancement.name} (${val.enhancement.cost} pts)`;
                  }
                });
              listText += "\n\nCreated with https://game-datacards.eu";
              navigator.clipboard.writeText(listText);
              message.success("List copied to clipboard.");
            }}></Button>
        </Space>
        {lists[selectedList].datacards.length === 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              width: "100vw",
              height: "calc(100% - 48px)",
              padding: "2px",
              paddingTop: "4px",
              paddingBottom: "4px",
              borderBottom: "2px solid #f0f2f5",
              paddingRight: "8px",
            }}>
            Your list is currently empty
          </div>
        )}
        {lists[selectedList].datacards
          ?.toSorted((a, b) => {
            if (a.warlord) {
              return -1;
            }
            if (b.warlord) {
              return 1;
            }
            return a.card.name.localeCompare(b.card.name);
          })
          .map((line, index) => {
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "16px",
                  width: "100vw",
                  height: !line.enhancement ? "36px" : "72px",
                  padding: "2px",
                  paddingTop: "4px",
                  paddingBottom: "4px",
                  borderBottom: "2px solid #f0f2f5",
                  paddingRight: "8px",
                  flexDirection: "column",
                }}
                key={`line.card.name-${line.id}`}>
                <Row style={{ width: "100%", alignItems: "center" }}>
                  <Col
                    span={14}
                    style={{ paddingLeft: "16px" }}
                    onClick={() => {
                      const cardFaction = dataSource.data.find((faction) => faction.id === line.card?.faction_id);
                      navigate(
                        `/viewer/${cardFaction.name.toLowerCase().replaceAll(" ", "-")}/${line.card.name
                          .replaceAll(" ", "-")
                          .toLowerCase()}`
                      );
                    }}>
                    {line.warlord && (
                      <span style={{ paddingRight: "8px" }}>
                        <CrownFilled />
                      </span>
                    )}
                    {line.card.name}
                  </Col>
                  <Col span={4} style={{ fontSize: "0.8rem" }}>
                    {line.points.models} models
                  </Col>
                  <Col span={4} style={{ fontSize: "0.8rem" }}>
                    {line.points.cost} pts
                  </Col>
                  <Col span={2} style={{ fontSize: "0.8rem" }}>
                    <Button
                      type="text"
                      size="large"
                      onClick={() => removeDatacard(line.id)}
                      icon={<DeleteOutlined />}
                    />
                  </Col>
                  {line.enhancement && (
                    <>
                      {" "}
                      <Col span={18} style={{ paddingLeft: "16px" }}>
                        {line.enhancement.name}
                      </Col>
                      <Col span={4} style={{ fontSize: "0.8rem" }}>
                        {line.enhancement.cost} pts
                      </Col>
                    </>
                  )}
                </Row>
              </div>
            );
          })}
      </div>
    </OutsideClickHandler>
  );
};
